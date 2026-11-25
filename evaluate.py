"""
탐지 정확도 평가 스크립트

테스트 서버의 각 페이지가 취약한지 안전한지 '정답'을 미리 정해두고,
스캐너를 실행한 결과와 비교하여 탐지율과 오탐률을 계산합니다.

  탐지율 = 취약 페이지 중 탐지한 비율   (높을수록 좋음)
  오탐률 = 안전 페이지 중 잘못 탐지한 비율 (낮을수록 좋음)

결과는 reports/evaluation.json 에 저장되며,
대시보드의 '진단 분석' 화면에 자동으로 표시됩니다.

실행: (local_server.py 를 켜둔 상태에서)
    python3 evaluate.py
"""

import json
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

from scanner import scan


TARGET = "http://127.0.0.1:8001"
OUTPUT = Path(__file__).resolve().parent / "reports" / "evaluation.json"

# 정답표: (페이지, 점검 유형, 정답)
#   vulnerable = 취약하게 만든 페이지 → 탐지되어야 함
#   safe       = 안전하게 만든 페이지 → 탐지되면 안 됨
TEST_CASES = [
    ("/vuln",        "SQL Injection", "vulnerable"),  # 문자열을 쿼리에 직접 연결 (GET)
    ("/vuln-post",   "SQL Injection", "vulnerable"),  # 문자열을 쿼리에 직접 연결 (POST)
    ("/vuln-id",     "SQL Injection", "vulnerable"),  # 숫자를 쿼리에 직접 연결
    ("/safe",        "SQL Injection", "safe"),        # 파라미터 바인딩
    ("/safe-id",     "SQL Injection", "safe"),        # 숫자도 파라미터 바인딩
    ("/vuln-blind",  "SQL Injection", "vulnerable"),  # 결과·오류를 숨김 (Blind, 한계 확인용)
    ("/echo",        "XSS",           "vulnerable"),  # 본문에 인코딩 없이 출력
    ("/echo-attr",   "XSS",           "vulnerable"),  # 속성값에 인코딩 없이 출력
    ("/escape",      "XSS",           "safe"),        # HTML 인코딩 후 출력
    ("/safe-filter", "XSS",           "safe"),        # 위험 문자 제거 후 출력
]


def detected_pages(findings):
    """findings 에서 (페이지 경로, 유형) 쌍의 집합을 만듭니다."""
    found = set()
    for finding in findings:
        path = urlparse(finding.get("location", "")).path
        found.add((path, finding.get("type")))
    return found


def main():
    # 정확도 평가는 실제 공격을 보내 확인하는 동적 분석을 기준으로 합니다.
    result = scan(TARGET, mode="dynamic")
    found = detected_pages(result["findings"])

    cases = []
    for page, vuln_type, expected in TEST_CASES:
        cases.append({
            "page": page,
            "type": vuln_type,
            "expected": expected,
            "detected": (page, vuln_type) in found,
        })

    vulnerable = [c for c in cases if c["expected"] == "vulnerable"]
    safe = [c for c in cases if c["expected"] == "safe"]
    tp = sum(c["detected"] for c in vulnerable)   # 취약 → 탐지 (정탐)
    fp = sum(c["detected"] for c in safe)         # 안전 → 탐지 (오탐)

    detection_rate = round(tp / len(vulnerable) * 100) if vulnerable else 0
    false_positive_rate = round(fp / len(safe) * 100) if safe else 0

    # 결과 출력
    print(f"{'페이지':<14}{'유형':<15}{'정답':<8}{'탐지':<6}판정")
    for c in cases:
        if c["expected"] == "vulnerable":
            verdict = "정탐" if c["detected"] else "미탐"
        else:
            verdict = "오탐" if c["detected"] else "정상"
        answer = "취약" if c["expected"] == "vulnerable" else "안전"
        mark = "O" if c["detected"] else "X"
        print(f"{c['page']:<14}{c['type']:<15}{answer:<8}{mark:<6}{verdict}")

    print()
    print(f"탐지율: {tp}/{len(vulnerable)} = {detection_rate}%")
    print(f"오탐률: {fp}/{len(safe)} = {false_positive_rate}%")

    # 대시보드가 읽는 형식으로 저장
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(
        json.dumps(
            {"evaluated_at": datetime.now().isoformat(timespec="seconds"), "cases": cases},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"\n결과 저장: {OUTPUT}")


if __name__ == "__main__":
    main()