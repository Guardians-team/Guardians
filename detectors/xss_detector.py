
from bs4 import BeautifulSoup
import re


class XSSDetector:

    def scan(self, html):

        findings = []
        soup = BeautifulSoup(html, "html.parser")

        # 1. HTML 이벤트 핸들러 확인
        event_attributes = [
            "onclick",
            "onerror",
            "onload",
            "onmouseover",
            "onfocus"
        ]

        for tag in soup.find_all(True):

            for attribute in event_attributes:

                if tag.has_attr(attribute):

                    findings.append({
                        "title": "Potential XSS: Inline Event Handler",
                        "type": "XSS Indicator",
                        "severity": "Medium",
                        "status": "Needs Review",
                        "location": str(tag.name),
                        "evidence": f"{attribute} 속성 발견",
                        "recommendation": (
                            "인라인 이벤트 핸들러 사용을 검토하고 "
                            "안전한 이벤트 등록 방식을 적용하세요."
                        )
                    })

        # 2. javascript: URL 확인
        for tag in soup.find_all(["a", "iframe", "form"]):

            for attribute in ["href", "src", "action"]:

                value = tag.get(attribute, "")

                if isinstance(value, str):
                    if re.match(
                        r"^\s*javascript\s*:",
                        value,
                        re.IGNORECASE
                    ):

                        findings.append({
                            "title": "Potential XSS: JavaScript URL",
                            "type": "XSS Indicator",
                            "severity": "High",
                            "status": "Needs Review",
                            "location": tag.name,
                            "evidence": f"{attribute}에 JavaScript URL 존재",
                            "recommendation": (
                                "URL 입력값 검증 및 허용 스킴 제한을 "
                                "적용하세요."
                            )
                        })

        # 3. JavaScript 위험 함수 사용 확인
        script_content = "\n".join(
            script.get_text()
            for script in soup.find_all("script")
        )

        dangerous_patterns = {
            "innerHTML": r"\.innerHTML\s*=",
            "document.write": r"document\.write\s*\(",
            "eval": r"\beval\s*\("
        }

        for name, pattern in dangerous_patterns.items():

            if re.search(pattern, script_content):

                findings.append({
                    "title": f"Potential XSS: {name} Usage",
                    "type": "XSS Indicator",
                    "severity": "Medium",
                    "status": "Needs Review",
                    "location": "JavaScript",
                    "evidence": f"{name} 사용 패턴 발견",
                    "recommendation": (
                        "외부 입력값이 해당 함수에 전달되는지 "
                        "확인하고 안전한 출력 처리를 적용하세요."
                    )
                })

        return findings
