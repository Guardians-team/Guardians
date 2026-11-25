# 🛡️ Guardians Verdict

웹 애플리케이션을 **정적 분석과 동적 분석 두 방식으로 점검**하여 보안 취약점을 탐지하고,
그 결과를 위험도·검증 상태로 **판정(Verdict)** 한 뒤 **QA 결함 리포트(Excel·PDF)와 대시보드**로
보여주는 로컬 보안 진단 도구입니다.

SQL Injection, Cross-Site Scripting(XSS), 보안 헤더 미설정을 점검하며,
탐지 결과를 재현 절차·기대/실제 결과·개선 권고가 포함된 QA 결함 리포트로 정리합니다.

---

## 📌 1. 프로젝트 개요

### 개발 목적

자동화된 웹 취약점 진단 결과에는 오탐 가능성이 있어, 담당자는 각 결과가 왜 취약하다고 판단되었는지
근거를 확인하고 이를 결함 리포트로 정리해야 합니다.
Guardians Verdict는 이 과정을 직접 구현한 진단 도구로, 탐지부터 판정, 리포트 작성, 결과 시각화까지를
하나의 흐름으로 제공합니다.

### 핵심 특징

- **정적 + 동적 두 가지 분석 방식**을 하나의 스캐너에서 수행하고, 분석 방식을 선택 가능
- 단순 "취약/안전"이 아닌 **검증 상태(Confirmed / Potential / Needs Review)** 로 판정
- 동적 분석 결과에 **전송한 입력값과 응답 차이 등 판정 근거**를 기록
- 실무 QA 양식 기반 **Excel·PDF 결함 리포트** 생성
- 진단 결과를 한눈에 보는 **React 대시보드**
- 정답을 아는 테스트 페이지로 **탐지율·오탐률 평가**

---

## 🔍 2. 정적 분석 vs 동적 분석

| 구분 | 정적 분석 (Static) | 동적 분석 (Dynamic) |
|---|---|---|
| 방식 | 응답 본문·헤더를 **읽어서** 패턴 탐지 | 입력 폼에 값을 **보내서** 반응 확인 |
| 서버 실행 | 불필요 | 필요 |
| 장점 | 빠르고 빠짐없이 훑음 | 실제 공격 성립 여부 확인 (신뢰도 높음) |
| 구현 위치 | `detectors/` | `dynamic/` |

두 방식의 결과는 하나의 리포트와 대시보드에 함께 표시되며, 각 결과에는 분석 방식(`static` / `dynamic`)이 표시됩니다.

---

## 🚀 3. 주요 기능

### 3.1 취약점 탐지

**SQL Injection**
- (동적) 작은따옴표 입력 시에만 SQL 오류가 새로 나타나는지 확인 (오류 기반)
- (동적) 항상 참 / 항상 거짓 조건의 응답 결과 차이 비교 (참/거짓 비교)
- (동적) 문자열 자리에서 탐지되지 않으면 숫자 자리용 값(`1'`, `1 OR 1=1`, `1 AND 1=2`)으로 한 번 더 검사
- (정적) 응답 본문의 SQL 오류 메시지 패턴 탐지

**Cross-Site Scripting (XSS)**
- (동적) 검증용 마커를 꺾쇠 문자와 함께 전송한 뒤, 인코딩 없이 반사되는지 확인
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

동적 SQL Injection 탐지는 오류 기반과 참/거짓 비교가 모두 확인되면 Confirmed(Critical),
참/거짓 비교만 확인되면 Potential(High), 오류만 확인되면 Needs Review(Medium)로 판정합니다.

### 3.3 QA 결함 리포트 (Excel·PDF)

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

동적 분석 결과는 항목별 재현 절차와 실제 결과가 함께 기록됩니다.

### 3.4 대시보드 (React)

- 위험도별 요약, 취약점 유형 분포, 진단 내역을 시각화
- 진단 관리 화면에서 분석 방식(정적 · 동적 · 정적+동적)을 선택해 진단
- 취약점 목록 화면에서 결함별 상세(재현 절차·탐지 근거·개선 권고) 확인
- 진단 분석 화면에서 탐지 정확도(평가 스크립트 결과) 및 진단 기록 비교
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
├── evaluate.py         # 탐지 정확도 평가 스크립트 (탐지율·오탐률)
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
├── reports/            # 생성된 리포트, 진단 기록, 평가 결과 저장
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

브라우저에서 `http://localhost:5173` 접속 → 진단 관리에서 `http://127.0.0.1:8001` 입력, 분석 방식 선택 후 진단 시작

### 6.4 탐지 정확도 평가

```bash
# 테스트 서버(local_server.py)를 켜둔 상태에서
python evaluate.py
```

결과는 `reports/evaluation.json` 에 저장되며, 대시보드의 **진단 분석** 화면에 표시됩니다.

---

## 🧪 7. 테스트 및 검증

### 자동 테스트

```bash
python -m pytest
```

### 검증 방식

평가 스크립트는 진단 대상 사이트가 아니라 **스캐너 자체의 탐지 정확도**를 검증합니다.
탐지율과 오탐률은 정답을 알아야 계산할 수 있으므로, 취약 여부를 미리 알고 있는 로컬 테스트 페이지를 대상으로 측정합니다.

- **탐지율** = 취약 페이지 중 탐지한 비율
- **오탐률** = 안전 페이지 중 잘못 탐지한 비율

| 테스트 페이지 | 성격 | 기대 결과 | 평가 결과 |
|---|---|---|---|
| `/vuln` | 취약한 SQL 검색 (문자열 연결, GET) | SQL Injection 탐지 | 정탐 |
| `/vuln-post` | 취약한 SQL 검색 (문자열 연결, POST) | SQL Injection 탐지 | 정탐 |
| `/vuln-id` | 취약한 SQL 검색 (숫자 연결) | SQL Injection 탐지 | 정탐 |
| `/vuln-blind` | 취약한 SQL 검색 (결과·오류 숨김, Blind) | SQL Injection 탐지 | **미탐** |
| `/safe` | 안전한 SQL 검색 (파라미터 바인딩) | 미탐지 | 정상 |
| `/safe-id` | 안전한 SQL 검색 (숫자 파라미터 바인딩) | 미탐지 | 정상 |
| `/echo` | 취약한 출력 (인코딩 없음) | XSS 탐지 | 정탐 |
| `/echo-attr` | 취약한 출력 (속성값에 인코딩 없음) | XSS 탐지 | 정탐 |
| `/escape` | 안전한 출력 (HTML 인코딩) | 미탐지 | 정상 |
| `/safe-filter` | 안전한 출력 (위험 문자 제거) | 미탐지 | 정상 |

### 평가 결과 (로컬 테스트 페이지 10개 기준, 동적 분석)

| 지표 | 결과 |
|---|---|
| 탐지율 | 5 / 6 = **83%** |
| 오탐률 | 0 / 4 = **0%** |

### 평가를 통한 개선과 한계

- **개선**: 첫 평가에서 숫자 자리 주입(`/vuln-id`)을 탐지하지 못했습니다(탐지율 80%, 당시 9개 페이지 기준).
  기준값만 넣어도 DB 오류가 발생해 오류 기반 조건이 성립하지 않았기 때문이며,
  숫자 자리용 검사값을 추가하여 탐지하도록 개선했습니다.
- **한계**: `/vuln-blind`는 현재 탐지 방식의 한계를 확인하기 위해 의도적으로 추가한 페이지입니다.
  오류와 조회 결과를 화면에 보여주지 않아 무엇을 입력해도 응답이 같으므로,
  화면 차이에 의존하는 현재 방식으로는 탐지할 수 없습니다.
  이러한 Blind SQL Injection은 응답 시간 차이를 이용한 시간 기반 탐지로 보완할 수 있습니다.

---

## 🔒 8. 보안 및 사용 제한

본 프로젝트는 교육 및 연구 목적으로 개발된 도구입니다.

- **안전 모드**: localhost(127.0.0.1) 대상만 진단하도록 제한되어 있습니다.
- 테스트 서버는 의도적으로 취약하게 만든 교육용 서버이므로 127.0.0.1에서만 실행합니다.
- 본인이 소유하거나 명시적 허가를 받은 환경에서만 사용합니다.
- 비파괴적 진단 방식을 적용하여 대상 데이터를 변경·삭제하지 않습니다.
- 진단 결과는 자동 분석에 따른 참고 자료이며, 실제 취약점 여부는 별도 검증이 필요합니다.

---

## 👥 9. 팀 역할

| 담당 | 역할 |
|---|---|
| 동적 분석 | 입력 폼 기반 능동 탐지(SQLi, XSS), 탐지 정확도 평가, 대시보드 및 API 연동 |
| 정적 분석 | 응답 패턴 기반 탐지(SQLi, XSS), 공용 유틸리티 |

---

## 🧭 10. 향후 과제

- 시간 기반 탐지를 통한 Blind SQL Injection 탐지
- 테스트 페이지를 확대한 탐지 정확도 평가
- 사이트 내 링크 크롤링으로 점검 범위 확대
- 정적·동적 분석 결과의 교차 확인을 통한 판정 신뢰도 강화
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
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [pytest Documentation](https://docs.pytest.org/)

---

## 📝 12. License

This project is developed for educational and research purposes.