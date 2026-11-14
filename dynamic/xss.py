"""
Reflected XSS 동적 탐지기

폼의 각 입력칸에 '마커 + 특수문자'를 넣어 보내고,
응답에 그 특수문자가 인코딩 없이 그대로 나타나면 취약으로 판단합니다.

  - 마커가 꺾쇠(< >)째로 그대로 반사됨  → Confirmed (High)
  - 마커는 반사되지만 꺾쇠는 인코딩됨    → 탐지 안 함 (안전하게 처리된 것)

마커는 payloads.json 의 reflection_marker 를 사용합니다. 평범한 문자열이라
서버에 해를 끼치지 않으면서, 응답에서 우리가 넣은 값만 콕 집어 찾을 수 있습니다.

이 모듈은 sender.py 로 요청을 보내기만 하고, 서버를 직접 알지 못합니다.
"""

from .sender import list_input_names, probe_field


DEFAULT_MARKER = "XSSPROBE7X9A"


def check_field(session, base_url, form, field_name, marker):
    """입력칸 하나를 검사해 finding(dict) 하나 또는 None 을 돌려줍니다."""

    # 마커를 꺾쇠 태그로 감싸서 보냄. 취약하면 이 태그가 그대로 응답에 박힘.
    payload = f"<{marker}>"
    probe = probe_field(session, base_url, form, field_name, payload)
    body = probe.body

    # 1) 꺾쇠째로 그대로 반사되었는가 → 취약
    reflected_raw = payload in body

    # 2) 꺾쇠가 인코딩되어 나왔는가 (&lt;marker&gt;) → 안전하게 처리됨
    encoded = f"&lt;{marker}&gt;" in body

    if not reflected_raw or encoded:
        return None

    return {
        "method": "dynamic",
        "type": "XSS",
        "severity": "High",
        "status": "Confirmed",
        "title": "Reflected XSS: 입력값이 인코딩 없이 응답에 반영됨",
        "location": probe.url.split("?")[0],
        "parameter": field_name,
        "steps": (
            f"1. {field_name} 입력칸에 검증용 마커를 꺾쇠와 함께 입력: {payload}\n"
            f"2. 응답 HTML에서 마커 주변 문자 확인"
        ),
        "expected": "특수문자(< >)가 HTML 엔티티로 인코딩되어야 함",
        "actual": f"입력한 '{payload}'가 인코딩 없이 그대로 출력됨",
        "evidence": f"marker reflected unencoded: {payload}",
        "recommendation": "출력 시 HTML 인코딩을 적용하고, CSP(Content-Security-Policy)를 설정하세요.",
    }


def detect(session, base_url, forms, payloads):
    """
    모든 폼의 모든 입력칸을 검사해 finding 목록을 돌려줍니다.
    scanner.py 가 이 함수를 호출합니다.
    """
    marker = payloads.get("reflection_marker", DEFAULT_MARKER)
    findings = []

    for form in forms:
        for field_name in list_input_names(form):
            finding = check_field(session, base_url, form, field_name, marker)
            if finding:
                findings.append(finding)

    return findings