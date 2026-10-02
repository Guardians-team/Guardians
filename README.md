# 🛡️ Web Vulnerability & QA Defect Report Generator

Python 기반의 웹 취약점 자동 진단 및 QA 결함 리포트 생성기입니다. 타겟 웹사이트의 입력 폼을 자동으로 탐색하여 기본적인 웹 취약점(SQL Injection, XSS)을 진단하고, 실무 QA 양식에 맞춘 엑셀 결함 리포트를 자동으로 출력해 줍니다.

---

## 📁 파일 구성 (File Structure)

프로젝트 루트 디렉토리는 다음과 같이 구성되어 있습니다.

```text
web-vulnerability-scanner/
│
├── scanner.py          # [진단 엔진] 타겟 크롤링, 폼 탐색 및 페이로드 자동 주입(Fuzzing)
├── reporter.py         # [리포트 모듈] 진단 결과를 파싱하여 실무형 엑셀 파일(.xlsx)로 변환
├── payloads.json       # [데이터] SQLi 및 XSS 공격 페이로드 패턴 모음
├── requirements.txt    # [의존성] 프로젝트 구동에 필요한 파이썬 라이브러리 목록
└── README.md           # [문서] 프로젝트 설명서 및 사용 가이드

## 🚀 주요 기능
- **자동 크롤링 및 입력 폼 탐색:** BeautifulSoup을 이용해 타겟 페이지 내의 Form 및 Input 필드 자동 식별
- **취약점 자동 진단 (Fuzzing):**
  - **SQL Injection (SQLi):** 에러 기반(Error-based) 취약점 탐지
  - **Cross-Site Scripting (XSS):** 반사형(Reflected) XSS 취약점 탐지
- **실무형 QA 리포트 자동 생성:** 발견된 취약점을 분석하여 재현 단계, 위험도 등이 포함된 `.xlsx` 파일 출력

---

## 📦 기술 스택
- **Language:** Python 3.x
- **Libraries:** 
  - `requests` (HTTP 요청 및 페이로드 전송)
  - `BeautifulSoup4` (HTML 파싱 및 입력 폼 탐색)
  - `pandas` / `openpyxl` (엑셀 리포트 생성)

---

## ⚙️ 설치 및 실행 방법

### 1. 라이브러리 설치
```bash
pip install -r requirements.txt

### 2. 프로그램 실행
```bash
python scanner.py --target "[http://testphp.vulnweb.com/artists.php?artist=1](http://testphp.vulnweb.com/artists.php?artist=1)"