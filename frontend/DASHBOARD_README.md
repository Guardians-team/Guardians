# Guardians 대시보드 (React)

## 넣는 위치

레포 루트에 그대로 풀면 됩니다. 기존 파이썬 파일은 건드리지 않습니다.

```
Guardians/
├── scanner.py, reporter.py, ...   (기존 그대로)
├── api.py                          ← 추가: 대시보드용 Flask API
└── frontend/                       ← 추가: React 대시보드
```

- `requirements.txt` 에 `flask>=3.0` 추가
- `.gitignore` 에 `frontend/node_modules/`, `frontend/dist/`, `reports/scans/`, `reports/*.xlsx` 추가

## 실행

```bash
python test_server.py                        # ① 진단 대상 테스트 서버 (5000)
python api.py                                # ② 대시보드 API (8000)
cd frontend && npm install && npm run dev    # ③ 대시보드 (5173)
```

브라우저에서 http://localhost:5173 을 엽니다.
②를 켜지 않으면 예시 데이터(`src/data/mock*.json`)로 화면이 뜹니다.

## 메뉴 켜고 끄기

`frontend/src/config/menu.js` 의 `enabled` 값만 바꾸면 됩니다.
`false` 로 바꾼 페이지는 사이드바에서 사라지고, 그 페이지로 가는 버튼과 링크도 함께 숨겨집니다.

```js
{ path: "/analysis", label: "진단 분석", icon: BarChart3, page: Analysis, enabled: false },
```

## 페이지

| 메뉴 | 파일 | 하는 일 |
|---|---|---|
| 대시보드 | `pages/Dashboard.jsx` | 요약 카드, 유형별 도넛, 위험도 막대, 최근 진단 3건 |
| 진단 관리 | `pages/Scans.jsx` | 새 진단 실행, 전체 기록 보기·재진단·삭제 |
| 취약점 목록 | `pages/Findings.jsx` | 진단별 결함 목록, 위험도 필터, 재현 절차 등 상세 |
| 진단 분석 | `pages/Analysis.jsx` | 탐지 정확도(탐지율·오탐률), 두 진단 비교 |
| 리포트 관리 | `pages/Reports.jsx` | 진단별 리포트 Excel / PDF 내려받기 |
| 설정 | `pages/Settings.jsx` | 테마, 기본 대상 URL, 리포트 작성자, 탐지 규칙 보기 |

## 구조

```
frontend/src/
├── App.jsx                   라우트 (config/menu.js 에서 자동 생성)
├── index.css                 테마 색 토큰 (화이트 / 다크 네이비)
├── config/menu.js            사이드바 메뉴 = 페이지 목록
├── context/AppContext.jsx    진단 기록, 설정, 진단 실행, PDF 출력
├── lib/
│   ├── api.js                API 호출, 미연결 시 예시 데이터로 대체
│   ├── stats.js              요약 수치, 진단 비교, 정확도 계산
│   ├── export.js             Excel 내려받기
│   └── format.js             위험도 색, 날짜 등 표시용 함수
├── data/                     예시 데이터
├── components/
│   ├── layout/               Sidebar, Topbar, Layout
│   ├── charts/               Sparkline, Donut, SeverityBars
│   ├── ui/                   배지, 버튼, 아이콘, 페이지 제목
│   ├── FindingsTable.jsx     결함 목록 (행을 누르면 상세)
│   └── PrintReport.jsx       PDF용 인쇄 레이아웃
└── pages/                    위 표의 6개 페이지
```

## 테마

`index.css` 의 `:root`(화이트)와 `[data-theme="dark"]`(다크 네이비) 변수만 고치면
화면 전체 색이 바뀝니다. 설정 페이지나 오른쪽 위 admin 메뉴에서 전환합니다.

## 내려받기

- **Excel**: API 연결 시 `reporter.py` 가 만든 `.xlsx`. 미연결 시 Excel에서 열리는 `.csv`.
- **PDF**: 브라우저 인쇄 창이 열립니다. 대상에서 "PDF로 저장"을 선택하세요.

## 스캐너와 맞춰야 할 데이터 형식

대시보드는 finding 에서 아래 필드를 읽습니다. 굵은 필드는 현재 `scan()` 에 없으므로
탐지 로직을 만들 때 채워 주세요. 없으면 화면에 "기록 없음"으로 표시됩니다.

`title`, `type`, `severity`, `status`, `location`, `evidence`, `recommendation`,
**`parameter`**, **`steps`**, **`expected`**, **`actual`**

## 탐지 정확도 데이터 (진단 분석 페이지)

평가 결과를 `reports/evaluation.json` 에 아래 형식으로 저장하면 표시됩니다.

```json
{
  "evaluated_at": "2026-11-20T22:00:00",
  "cases": [
    { "page": "/vuln", "type": "SQL Injection", "expected": "vulnerable", "detected": true },
    { "page": "/safe", "type": "SQL Injection", "expected": "safe", "detected": false }
  ]
}
```
