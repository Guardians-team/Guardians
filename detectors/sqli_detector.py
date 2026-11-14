
import re


class SQLInjectionDetector:

    def scan(self, response_body, signatures):

        findings = []

        for signature in signatures:

            pattern = signature.get("pattern", "")
            label = signature.get("label", "Unknown SQL Error")

            if not pattern:
                continue

            try:
                matched = re.search(
                    pattern,
                    response_body,
                    re.IGNORECASE
                )

            except re.error:
                continue

            if matched:

                findings.append({
                    "title": "Possible Database Error Disclosure",
                    "type": "SQL Injection Indicator",
                    "severity": "Medium",
                    "status": "Needs Review",
                    "location": "HTTP Response Body",
                    "evidence": label,
                    "recommendation": (
                        "데이터베이스 오류 메시지가 외부에 "
                        "노출되지 않도록 오류 처리 방식을 검토하세요."
                    )
                })

        return findings
