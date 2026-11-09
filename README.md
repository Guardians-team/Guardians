# 🛡️ Web Vulnerability & QA Defect Report Generator

Python 기반의 웹 애플리케이션 취약점 자동 진단 및 QA 결함 리포트 생성 프로젝트입니다.

테스트 대상 웹사이트의 페이지와 입력 폼을 자동으로 탐색하고, SQL Injection 및 XSS 등 기본적인 웹 보안 취약 가능성을 점검합니다.

진단 결과를 분석하여 취약점 유형, 위험도, 재현 절차, 기대 결과 및 개선 방안이 포함된 실무형 QA 결함 리포트(Defect Report)를 Excel(.xlsx) 파일로 자동 생성합니다.

---

## 📌 1. Project Overview

### 프로젝트명
**웹 취약점 자동 진단 및 QA 결함 리포트 생성 시스템**

### 개발 목적

기존 웹 애플리케이션 보안 점검 과정에서 발생하는 수동 진단 및 결과 보고서 작성의 비효율성을 개선하는 것을 목표로 합니다.

웹 취약점 진단부터 결과 분석, 위험도 분류 및 QA 리포트 생성까지 자동화하여 보안 점검과 QA 업무의 효율성을 높이고자 합니다.

### 핵심 목표

- 웹 애플리케이션의 주요 보안 취약점 자동 점검
- 웹 페이지 및 입력 폼 자동 탐색
- 취약점 유형 및 위험도 분류
- 진단 결과의 체계적인 관리
- 실무 QA 양식 기반 Excel 리포트 자동 생성

---

## 🚀 2. 주요 기능 (Features)

### 2.1 자동 크롤링 및 입력 폼 탐색

- BeautifulSoup을 이용한 HTML 페이지 분석
- 웹 페이지 내 Form 및 Input 필드 식별
- URL 및 입력 파라미터 수집
- 테스트 대상 페이지 정보 정리

### 2.2 웹 취약점 자동 진단

**SQL Injection (SQLi)**
- SQL Injection 취약 가능성 점검
- 데이터베이스 오류 응답 여부 분석
- 입력값에 따른 응답 차이 확인

**Cross-Site Scripting (XSS)**
- Reflected XSS 취약 가능성 점검
- 사용자 입력값의 응답 반영 여부 분석
- HTML 출력 인코딩 여부 확인

**Security Configuration**
- HTTP 보안 헤더 확인
- 기본적인 웹 보안 설정 점검

### 2.3 취약점 분석 및 위험도 분류

진단 결과를 바탕으로 취약점 유형과 위험도를 분류합니다.

**위험도 분류**
- Critical
- High
- Medium
- Low
- Informational

**진단 상태 분류**
- Confirmed: 추가 검증을 통해 취약점이 확인된 상태
- Potential: 취약 가능성이 발견된 상태
- Not Detected: 점검 항목에서 취약점이 발견되지 않은 상태
- Needs Review: 추가적인 수동 검증이 필요한 상태

> 단순 응답 패턴만으로 실제 취약점이 확정되지 않도록 탐지 근거와 검증 상태를 구분합니다.

### 2.4 QA 결함 리포트 자동 생성

진단 결과를 분석하여 Excel(.xlsx) 형식의 QA 결함 리포트를 생성합니다.

**리포트 주요 항목**

| 항목 | 설명 |
|---|---|
| Defect ID | 결함 식별 번호 |
| Defect Title | 결함 제목 |
| Vulnerability Type | 취약점 유형 |
| Severity | 위험도 |
| Status | 검증 상태 |
| Affected URL | 취약점 발생 위치 |
| Steps to Reproduce | 재현 절차 |
| Expected Result | 기대 결과 |
| Actual Result | 실제 결과 |
| Recommendation | 개선 권고 사항 |
| Scan Date | 진단 일시 |

---

## 🛠️ 3. 기술 스택 (Tech Stack)

| 구분 | 기술 | 사용 목적 |
|---|---|---|
| Language | Python 3.x | 전체 프로그램 구현 |
| HTTP Request | Requests | HTTP 통신 및 응답 분석 |
| HTML Parser | BeautifulSoup4 | HTML 분석 및 입력 폼 탐색 |
| Data Processing | Pandas | 진단 결과 데이터 처리 |
| Excel Report | OpenPyXL | Excel QA 리포트 생성 |
| Test Environment | OWASP Juice Shop | 취약점 진단 검증 |
| Version Control | Git / GitHub | 소스 코드 및 버전 관리 |

---

## 📁 4. 프로젝트 구조 (File Structure)

```text
web-vulnerability-scanner/
│
├── scanner.py              # 취약점 진단 엔진
│                           # 웹 크롤링 및 입력 폼 탐색
│
├── reporter.py             # QA 리포트 생성 모듈
│                           # 진단 결과를 Excel 파일로 변환
│
├── payloads.json           # 테스트 데이터 관리
│                           # 취약점 유형별 검증 데이터
│
├── requirements.txt        # 프로젝트 의존성 관리
│
├── README.md               # 프로젝트 설명서
│
├── reports/                # 생성된 Excel 리포트 저장
│   └── .gitkeep
│
└── tests/                  # 기능 테스트
    └── test_reporter.py
```

---

## ⚙️ 5. 설치 및 실행 방법 (Installation)

### 5.1 저장소 복제

```bash
git clone [GitHub Repository URL]
cd web-vulnerability-scanner
```

### 5.2 Python 가상환경 생성

```bash
python -m venv venv
```

**macOS / Linux**

```bash
source venv/bin/activate
```

**Windows**

```bash
venv\Scripts\activate
```

### 5.3 라이브러리 설치

```bash
pip install -r requirements.txt
```

### 5.4 프로그램 실행

```bash
python scanner.py --target "[허가된 테스트 URL]"
```

> 실제 실행 옵션은 scanner.py 구현에 따라 확정합니다.

### 5.5 결과 확인

진단이 완료되면 `reports/` 디렉터리에 Excel QA 결함 리포트가 저장됩니다.

---

## 🧪 6. 테스트 및 검증 환경 (Testing Environment)

본 프로젝트는 교육 및 연구 목적으로 구성된 테스트 환경에서 기능을 검증합니다.

**테스트 환경**
- OWASP Juice Shop
- 로컬 테스트 웹 애플리케이션
- 취약점이 없는 정상 웹 페이지

**주요 검증 항목**
- 웹 페이지 및 입력 폼 수집 여부
- SQL Injection 취약 가능성 탐지 여부
- XSS 취약 가능성 탐지 여부
- 위험도 분류 결과의 적절성
- 진단 결과 데이터의 정확성
- Excel QA 리포트 생성 여부

**검증 목표**

취약점이 존재하는 테스트 페이지와 정상 페이지를 비교하여 진단 결과의 정확도와 오탐 가능성을 평가합니다.

---

## 📊 7. QA 리포트 예시 (Report Example)

| 항목 | 내용 |
|---|---|
| Defect ID | VUL-001 |
| Defect Title | 입력값 검증 취약 가능성 |
| Vulnerability | XSS |
| Severity | High (예시) |
| Status | Potential |
| Affected URL | 로컬 테스트 페이지 |
| Expected Result | 입력값이 안전하게 처리되어야 함 |
| Actual Result | 입력값이 HTML 응답에 반영됨 |
| Recommendation | 출력 인코딩 및 입력값 검증 적용 |

> 위 내용은 리포트 형식 예시이며 실제 진단 결과가 아닙니다.

---

## 📅 8. 개발 진행 계획 (Development Roadmap)

| 단계 | 개발 내용 | 결과물 |
|---|---|---|
| 1단계 | Python 개발 환경 구축 | 실행 환경 |
| 2단계 | 웹 크롤링 및 입력 폼 탐색 | 페이지 수집 기능 |
| 3단계 | SQL Injection 진단 기능 | SQLi 진단 모듈 |
| 4단계 | XSS 진단 기능 | XSS 진단 모듈 |
| 5단계 | 진단 결과 분석 및 위험도 분류 | 분석 모듈 |
| 6단계 | Excel QA 리포트 생성 | XLSX 보고서 |
| 7단계 | 테스트 및 결과 검증 | 테스트 결과 |
| 8단계 | 기능 개선 및 최종 문서화 | 최종 프로젝트 |

---

## 🎯 9. 기대 효과 (Expected Results)

- 웹 애플리케이션 보안 점검 과정의 자동화
- 취약점 진단 결과의 체계적인 관리
- QA 결함 리포트 작성 시간 단축
- 취약점별 개선 사항의 명확한 전달
- 보안 진단과 QA 업무 간 연계성 강화

---

## 🔒 10. 보안 및 사용 제한 (Security Notice)

본 프로젝트는 교육 및 연구 목적으로 개발된 도구입니다.

- 본인이 소유하거나 명시적인 진단 허가를 받은 테스트 환경에서만 사용합니다.
- 외부 서비스에 대한 무단 스캔 및 취약점 진단을 금지합니다.
- 테스트 과정에서 실제 데이터의 변경 및 삭제를 유발하지 않도록 비파괴적인 진단 방식을 적용합니다.
- 진단 결과는 자동 분석에 따른 참고 자료이며, 실제 취약점 여부는 별도의 검증이 필요합니다.
- 테스트 대상과 범위를 사전에 명확하게 설정합니다.

---

## 📚 11. Reference

- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Python Documentation](https://docs.python.org/3/)
- [Requests Documentation](https://requests.readthedocs.io/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [OpenPyXL Documentation](https://openpyxl.readthedocs.io/)

---

## 📝 12. License

This project is developed for educational and research purposes.