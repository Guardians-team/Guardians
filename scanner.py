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

    findings = []

    body = response.text[:500000]

    # SQL 오류 메시지 지표 확인
    for signature in payloads.get(
        "sql_error_signatures", []
    ):

        if re.search(
            signature["pattern"],
            body,
            re.IGNORECASE
        ):

            findings.append({
                "title": "Possible Database Error Disclosure",
                "type": "SQL Injection Indicator",
                "severity": "Medium",
                "status": "Needs Review",
                "location": response.url,
                "evidence": signature["label"],
                "recommendation": (
                    "오류 메시지 노출 여부를 검토하고 "
                    "일반화된 오류 응답을 적용하세요."
                )
            })

            break

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


def scan(target):

    validate_target(target)

    payloads = load_payloads()

    session = requests.Session()

    session.headers.update({
        "User-Agent": "Educational-Passive-Scanner/1.0"
    })

    # 리다이렉트를 자동으로 따라가지 않음
    response = session.get(
        target,
        timeout=8,
        allow_redirects=False
    )

    response.raise_for_status()

    forms = collect_forms(response.text)

    findings = inspect_response(
        response,
        payloads
    )

    return {
        "target": target,
        "scan_date": datetime.now().isoformat(
            timespec="seconds"
        ),
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

    args = parser.parse_args()

    try:
        result = scan(args.target)

    except (ValueError, requests.RequestException) as error:
        parser.error(str(error))

    REPORT_DIR.mkdir(exist_ok=True)

    output = REPORT_DIR / "qa_defect_report.xlsx"

    generate_report(result, output)

    print("진단이 완료되었습니다.")
    print(f"발견된 검토 항목: {len(result['findings'])}")
    print(f"리포트 저장 위치: {output}")


if __name__ == "__main__":
    main()