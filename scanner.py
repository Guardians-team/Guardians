import argparse
import json
import re

from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from ipaddress import ip_address

import requests
from bs4 import BeautifulSoup

from reporter import generate_report

# 정적 탐지기 (친구 담당): 응답 본문을 읽어 패턴을 찾음
from detectors import XSSDetector, SQLInjectionDetector

# 동적 탐지기 (본인 담당): 폼에 값을 넣어 요청을 보내 확인
from dynamic.sqli import detect as detect_sqli_dynamic


BASE_DIR = Path(__file__).resolve().parent

PAYLOADS_FILE = BASE_DIR / "payloads.json"
REPORT_DIR = BASE_DIR / "reports"


def validate_target(url):

    parsed = urlparse(url)
    host = parsed.hostname or ""

    if parsed.scheme not in ("http", "https"):
        raise ValueError("HTTP 또는 HTTPS 주소만 허용됩니다.")

    try:
        is_local = (
            host.lower() == "localhost"
            or ip_address(host).is_loopback
        )
    except ValueError:
        is_local = False

    if not is_local:
        raise ValueError(
            "안전 모드에서는 localhost만 진단할 수 있습니다."
        )

    return url


def load_payloads():

    with open(PAYLOADS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def collect_forms(html):

    soup = BeautifulSoup(html, "html.parser")

    forms = []

    for index, form in enumerate(
        soup.find_all("form"), start=1
    ):

        forms.append({
            "form_number": index,
            "method": form.get("method", "GET").upper(),
            "action": form.get("action", ""),
            "inputs": [
                {
                    "name": item.get("name"),
                    "type": item.get("type", "text")
                }
                for item in form.find_all(
                    ["input", "textarea", "select"]
                )
            ]
        })

    return forms


def inspect_response(response, payloads):
    """정적 점검: 이미 받은 응답 본문과 헤더를 읽어 문제를 찾음 (요청을 더 보내지 않음)."""

    findings = []
    body = response.text[:500000]

    # XSS 정적 탐지
    xss_detector = XSSDetector()
    findings.extend(xss_detector.scan(body))

    # SQL 오류 지표 탐지
    sqli_detector = SQLInjectionDetector()
    findings.extend(
        sqli_detector.scan(
            body,
            payloads.get("sql_error_signatures", [])
        )
    )

    # 보안 헤더 확인
    response_headers = {
        key.lower() for key in response.headers
    }

    for header, description in payloads.get(
        "security_headers", {}
    ).items():

        if header.lower() not in response_headers:

            findings.append({
                "title": f"Missing Security Header: {header}",
                "type": "Security Configuration",
                "severity": "Low",
                "status": "Potential",
                "location": "HTTP Response Headers",
                "evidence": description,
                "recommendation": (
                    f"{header} 헤더 적용 여부를 검토하세요."
                )
            })

    return findings


def tag_method(findings, method):
    """각 finding 에 분석 방식(static/dynamic)을 표시. 이미 있으면 그대로 둠."""
    for finding in findings:
        finding.setdefault("method", method)
    return findings


def scan(target, mode="both"):
    """
    mode: "static" | "dynamic" | "both"
      static  → 응답 본문·헤더를 읽어서 점검 (요청 1회)
      dynamic → 폼에 값을 넣어 보내며 능동 점검
      both    → 둘 다 (기본값)
    """

    validate_target(target)

    payloads = load_payloads()

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Educational-Scanner/1.0"
    })

    # 리다이렉트를 자동으로 따라가지 않음
    response = session.get(
        target,
        timeout=8,
        allow_redirects=False
    )
    response.raise_for_status()

    forms = collect_forms(response.text)

    findings = []

    if mode in ("static", "both"):
        findings += tag_method(inspect_response(response, payloads), "static")

    if mode in ("dynamic", "both"):
        findings += tag_method(
            detect_sqli_dynamic(session, target, forms, payloads),
            "dynamic"
        )

    return {
        "target": target,
        "mode": mode,
        "scan_date": datetime.now().isoformat(timespec="seconds"),
        "http_status": response.status_code,
        "forms_found": forms,
        "findings": findings
    }


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--target",
        required=True,
        help="허가된 localhost 테스트 주소"
    )
    parser.add_argument(
        "--mode",
        choices=["static", "dynamic", "both"],
        default="both",
        help="분석 방식 선택 (기본: both)"
    )

    args = parser.parse_args()

    try:
        result = scan(args.target, mode=args.mode)

    except (ValueError, requests.RequestException) as error:
        parser.error(str(error))

    REPORT_DIR.mkdir(exist_ok=True)

    output = REPORT_DIR / "qa_defect_report.xlsx"

    generate_report(result, output)

    print("진단이 완료되었습니다.")
    print(f"분석 방식: {result['mode']}")
    print(f"발견된 항목: {len(result['findings'])}")
    print(f"리포트 저장 위치: {output}")


if __name__ == "__main__":
    main()