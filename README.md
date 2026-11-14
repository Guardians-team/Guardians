# 🛡️ Guardians Verdict

웹 애플리케이션을 **정적 분석과 동적 분석 두 방식으로 점검**하여 보안 취약점을 탐지하고,
그 결과를 위험도·검증 상태로 **판정(Verdict)** 한 뒤 **QA 결함 리포트(Excel)와 대시보드**로
보여주는 로컬 보안 진단 도구입니다.

SQL Injection, Cross-Site Scripting(XSS), 보안 헤더 미설정을 점검하며,
탐지 결과를 재현 절차·기대/실제 결과·개선 권고가 포함된 실무형 QA 결함 리포트로 자동 변환합니다.

---

## 📌 1. 프로젝트 개요

### 개발 목적

기존 웹 보안 점검 과정은 진단과 결함 보고서 작성이 대부분 수동으로 이루어져 비효율적입니다.
Guardians Verdict는 **취약점 탐지부터 판정, 리포트 작성, 결과 시각화까지 자동화**하여
보안 점검과 QA 업무의 효율을 높이는 것을 목표로 합니다.

### 핵심 특징

- **정적 + 동적 두 가지 분석 방식**으로 같은 취약점을 다른 관점에서 점검
- 단순 "취약/안전"이 아닌 **검증 상태(Confirmed / Potential / Needs Review)** 로 판정
- 실무 QA 양식 기반 **Excel 결함 리포트 자동 생성**
- 진단 결과를 한눈에 보는 **React 대시보드**

---

## 🔍 2. 정적 분석 vs 동적 분석

| 구분 | 정적 분석 (Static) | 동적 분석 (Dynamic) |
|---|---|---|
| 방식 | 응답 본문·헤더를 **읽어서** 패턴 탐지 | 입력 폼에 값을 **보내서** 반응 확인 |
| 서버 실행 | 불필요 | 필요 |
| 장점 | 빠르고 빠짐없이 훑음 | 실제 공격 성립 여부 확인 (신뢰도 높음) |
| 구현 위치 | `detectors/` | `dynamic/` |

두 방식을 함께 사용하여, 정적 분석이 의심한 취약점을 동적 분석이 실제로 확인하는 구조입니다.
탐지 근거가 많을수록 더 높은 검증 상태로 판정합니다.

---

## 🚀 3. 주요 기능

### 3.1 취약점 탐지

**SQL Injection**
- (동적) 작은따옴표 입력 시 SQL 오류 발생 여부 확인 (오류 기반)
- (동적) 항상 참 / 항상 거짓 조건의 응답 차이 비교 (Boolean 기반)
- (정적) 응답 본문의 SQL 오류 메시지 패턴 탐지

**Cross-Site Scripting (XSS)**
- (동적) 검증용 마커를 특수문자와 함께 전송 후, 인코딩 없이 반사되는지 확인
- (정적) 응답 본문의 위험 패턴 탐지

**Security Configuration**
- 주요 HTTP 보안 헤더(Content-Security-Policy 등) 설정 여부 점검

### 3.2 위험도 및 검증 상태 판정

**위험도**: Critical / High / Medium / Low / Informational

**검증 상태**
- `Confirmed` : 탐지 근거가 충분히 확인됨
- `Potential` : 취약 가능성이 있음
- `Needs Review` : 추가 수동 검증 필요

> 단순 응답 패턴만으로 취약점을 확정하지 않도록, 탐지 근거와 검증 상태를 구분합니다.

### 3.3 QA 결함 리포트 (Excel)

| 항목 | 설명 |
|---|---|
| Defect ID | 결함 식별 번호 |
| Defect Title | 결함 제목 |
| Vulnerability Type | 취약점 유형 |
| Severity | 위험도 |
| Status | 검증 상태 |
| Affected URL | 취약점 발생 위치 |
| Steps to Reproduce | 재현 절차 |
| Expected / Actual Result | 기대 결과 / 실제 결과 |
| Recommendation | 개선 권고 |
| Scan Date | 진단 일시 |

### 3.4 대시보드 (React)

- 위험도별 요약, 취약점 유형 분포, 진단 내역을 시각화
- 취약점별 상세(재현 절차·탐지 근거·개선 권고) 확인
- Excel / PDF 리포트 내려받기
- 화이트 / 다크 네이비 테마 전환

---

## 🛠️ 4. 기술 스택

| 구분 | 기술 |
|---|---|
| 언어 | Python 3.x |
| HTTP 통신 | Requests |
| HTML 분석 | BeautifulSoup4 |
| Excel 리포트 | OpenPyXL |
| 대시보드 API | Flask |
| 대시보드 화면 | React (Vite) |
| 테스트 | pytest |
| 버전 관리 | Git / GitHub (Git Flow) |

---

## 📁 5. 프로젝트 구조

```text
Guardians/
├── scanner.py          # 진단 지휘: mode(static/dynamic/both)에 따라 분석기 호출
├── local_server.py     # 취약/안전 테스트 서버 (교육용, 127.0.0.1:8001)
├── payloads.json       # 탐지 규칙 (SQL 오류 패턴, XSS 마커, 보안 헤더 목록)
├── reporter.py         # Excel QA 결함 리포트 생성
├── api.py              # 대시보드용 Flask API
│
├── detectors/          # 정적 분석 (응답 본문·헤더 패턴 탐지)
│   ├── sqli_detector.py
│   └── xss_detector.py
│
├── dynamic/            # 동적 분석 (입력 폼에 값을 보내 확인)
│   ├── sender.py       #   요청 전송 공용 도구
│   ├── sqli.py         #   SQL Injection 탐지
│   └── xss.py          #   Reflected XSS 탐지
│
├── utils/              # 공용 유틸리티
├── reports/            # 생성된 리포트 저장
├── tests/              # pytest 테스트
└── frontend/           # React 대시보드
```

---

## ⚙️ 6. 설치 및 실행

### 6.1 저장소 복제 및 환경 설정

```bash
git clone https://github.com/Guardians-team/Guardians.git
cd Guardians

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 6.2 스캐너 실행 (CLI)

터미널 2개를 사용합니다.

```bash
# 터미널 1: 테스트 대상 서버 실행
python local_server.py

# 터미널 2: 진단 실행
python scanner.py --target http://127.0.0.1:8001 --mode both
```

`--mode` 옵션: `static`(정적), `dynamic`(동적), `both`(둘 다, 기본값)

진단이 끝나면 `reports/qa_defect_report.xlsx` 가 생성됩니다.

### 6.3 대시보드 실행

터미널 3개를 사용합니다.

```bash
# 터미널 1: 테스트 대상 서버 (8001)
python local_server.py

# 터미널 2: 대시보드 API (8000)
python api.py

# 터미널 3: 대시보드 화면 (5173)
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 → 상단 검색창에 `http://127.0.0.1:8001` 입력 후 Enter

---

## 🧪 7. 테스트 및 검증

### 자동 테스트

```bash
python -m pytest
```

### 검증 방식

의도적으로 취약하게 만든 페이지와 안전하게 만든 페이지를 비교하여,
취약 페이지는 탐지하고 안전 페이지는 탐지하지 않는지(오탐 여부)를 확인합니다.

| 테스트 페이지 | 성격 | 기대 결과 |
|---|---|---|
| `/vuln` | 취약한 SQL 검색 (문자열 연결) | SQL Injection 탐지 |
| `/safe` | 안전한 SQL 검색 (파라미터 바인딩) | 미탐지 |
| `/echo` | 취약한 출력 (인코딩 없음) | XSS 탐지 |
| `/escape` | 안전한 출력 (HTML 인코딩) | 미탐지 |

---

## 🔒 8. 보안 및 사용 제한

본 프로젝트는 교육 및 연구 목적으로 개발된 도구입니다.

- **안전 모드**: localhost(127.0.0.1) 대상만 진단하도록 제한되어 있습니다.
- 본인이 소유하거나 명시적 허가를 받은 환경에서만 사용합니다.
- 비파괴적 진단 방식을 적용하여 대상 데이터를 변경·삭제하지 않습니다.
- 진단 결과는 자동 분석에 따른 참고 자료이며, 실제 취약점 여부는 별도 검증이 필요합니다.

---

## 👥 9. 팀 역할

| 담당 | 역할 |
|---|---|
| 동적 분석 | 입력 폼 기반 능동 탐지(SQLi, XSS), 대시보드 연동 |
| 정적 분석 | 응답 패턴 기반 탐지(SQLi, XSS), 유틸리티 |

---

## 🧭 10. 향후 과제

- 정적·동적 교차 확인을 통한 판정 신뢰도 강화
- 탐지 정확도 평가(탐지율·오탐률) 자동화
- 사이트 내 링크 크롤링으로 점검 범위 확대
- 서버형 배포 시 계정·권한 관리 및 진단 대상 소유권 검증

---

## 📚 11. Reference

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
- [Python Documentation](https://docs.python.org/3/)
- [Requests Documentation](https://requests.readthedocs.io/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [OpenPyXL Documentation](https://openpyxl.readthedocs.io/)

---

## 📝 12. License

This project is developed for educational and research purposes.