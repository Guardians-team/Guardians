
def inspect_response(response, payloads):

    findings = []
    body = response.text[:500000]

    # XSS 정적 탐지
    xss_detector = XSSDetector()

    findings.extend(
        xss_detector.scan(body)
    )

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
