"""
SQL Injection 동적 탐지기

폼의 각 입력칸에 공격 문자열을 넣어 보내고, 응답을 비교해 취약 여부를 판단합니다.
두 가지 방식을 씁니다.

  1. 오류 기반   : 작은따옴표를 넣었을 때만 SQL 오류 문구가 새로 나타나는가
  2. 참/거짓 비교: 항상 참 / 항상 거짓 조건에서 응답이 뚜렷하게 달라지는가

판정:
  - 두 방식 모두 걸림           → Confirmed    (Critical)
  - 참/거짓 비교만 걸림         → Potential    (High)
  - 오류만 걸림                 → Needs Review (Medium)

이 모듈은 sender.py 로 요청을 보내기만 하고, 서버를 직접 알지 못합니다.
"""

import re

from .sender import list_input_names, probe_field


# 참/거짓 비교용 입력값. 작은따옴표로 기존 조건을 닫고 OR/AND 를 붙입니다.
# 문자열 자리용: 작은따옴표로 기존 조건을 닫고 OR/AND 를 붙입니다.
STRING_PROBES = {
    "normal": "test",
    "error": "'",
    "true": "x' OR '1'='1",
    "false": "x' AND '1'='2",
}

# 숫자 자리용: 따옴표 없이 쓰이는 입력값(예: id)을 위한 값입니다.
NUMERIC_PROBES = {
    "normal": "1",
    "error": "1'",
    "true": "1 OR 1=1",
    "false": "1 AND 1=2",
}


def has_sql_error(body, signatures):
    """응답 본문에 SQL 오류 지표가 있으면 그 라벨을, 없으면 None 을 돌려줍니다."""
    for signature in signatures:
        if re.search(signature["pattern"], body, re.IGNORECASE):
            return signature["label"]
    return None


def result_count(body):
    """'검색 결과: N건' 문구에서 N 을 꺼냅니다. '결과가 없습니다'는 0, 둘 다 없으면 None."""
    match = re.search(r"검색 결과:\s*(\d+)\s*건", body)
    if match:
        return int(match.group(1))
    if "검색 결과가 없습니다" in body:
        return 0
    return None


def responses_differ(true_body, false_body):
    """
    참 조건과 거짓 조건의 응답이 뚜렷하게 다른지 판단합니다.
    먼저 '결과 건수'를 비교하고, 건수 문구가 없으면 본문 길이로 비교합니다.
    """
    true_count = result_count(true_body)
    false_count = result_count(false_body)
    if true_count is not None and false_count is not None:
        return true_count != false_count

    # 건수 문구가 없는 페이지: 길이 차이가 크면 다르다고 봄 (오탐 방지용 여유값)
    return abs(len(true_body) - len(false_body)) > 30


def probe_set(session, base_url, form, field_name, signatures, probes):
    """한 가지 입력값 묶음(문자열용 또는 숫자용)으로 검사하고 근거를 돌려줍니다."""
    normal = probe_field(session, base_url, form, field_name, probes["normal"])

    # 1. 오류 기반: 정상값에서는 오류가 없고, 오류 유발값에서만 오류가 나타나는가
    normal_error = has_sql_error(normal.body, signatures)
    error_probe = probe_field(session, base_url, form, field_name, probes["error"])
    error_label = has_sql_error(error_probe.body, signatures)
    error_based = error_label is not None and normal_error is None

    # 2. 참/거짓 비교
    true_probe = probe_field(session, base_url, form, field_name, probes["true"])
    false_probe = probe_field(session, base_url, form, field_name, probes["false"])
    boolean_based = responses_differ(true_probe.body, false_probe.body)

    return {
        "url": normal.url.split("?")[0],
        "error_based": error_based,
        "error_label": error_label,
        "boolean_based": boolean_based,
        "true_count": result_count(true_probe.body),
        "false_count": result_count(false_probe.body),
        "probes": probes,
    }


def check_field(session, base_url, form, field_name, signatures):
    """입력칸 하나를 검사해 finding(dict) 하나 또는 None 을 돌려줍니다.

    먼저 문자열 자리 기준으로 검사하고, 탐지되지 않으면
    숫자 자리 기준(따옴표 없이 쓰이는 입력값)으로 한 번 더 검사합니다.
    """
    r = probe_set(session, base_url, form, field_name, signatures, STRING_PROBES)
    if not (r["error_based"] or r["boolean_based"]):
        r = probe_set(session, base_url, form, field_name, signatures, NUMERIC_PROBES)
    if not (r["error_based"] or r["boolean_based"]):
        return None

    # 판정
    if r["error_based"] and r["boolean_based"]:
        severity, status = "Critical", "Confirmed"
    elif r["boolean_based"]:
        severity, status = "High", "Potential"
    else:
        severity, status = "Medium", "Needs Review"

    evidence_parts = []
    if r["error_based"]:
        evidence_parts.append(f"오류 노출: {r['error_label']}")
    if r["boolean_based"]:
        evidence_parts.append(
            f"참/거짓 응답 차이 (참 {r['true_count']} / 거짓 {r['false_count']})"
        )
    probes = r["probes"]

    return {
        "method": "dynamic",
        "type": "SQL Injection",
        "severity": severity,
        "status": status,
        "title": "SQL Injection: 입력값이 쿼리 처리에 영향을 줌",
        "location": r["url"],
        "parameter": field_name,
        "steps": (
            f"1. {field_name} 입력칸에 {probes['error']} 입력\n"
            f"2. 항상 참 조건({probes['true']})과 "
            f"항상 거짓 조건({probes['false']})을 각각 입력\n"
            f"3. 오류 발생 여부와 응답 결과 비교"
        ),
        "expected": "입력값과 관계없이 쿼리 구조가 유지되어야 함",
        "actual": " / ".join(evidence_parts),
        "evidence": " / ".join(evidence_parts),
        "recommendation": "파라미터 바인딩(Prepared Statement)을 적용하세요.",
    }


def detect(session, base_url, forms, payloads):
    """
    모든 폼의 모든 입력칸을 검사해 finding 목록을 돌려줍니다.
    scanner.py 가 이 함수를 호출합니다.
    """
    signatures = payloads.get("sql_error_signatures", [])
    findings = []

    for form in forms:
        for field_name in list_input_names(form):
            finding = check_field(session, base_url, form, field_name, signatures)
            if finding:
                findings.append(finding)

    return findings