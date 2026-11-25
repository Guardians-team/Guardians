"""
로컬 전용 테스트 서버 (정확도 평가용 페이지 포함)

[SQL Injection]
  /vuln          취약 : 입력값을 쿼리 문자열에 직접 연결 (GET)
  /safe          안전 : 파라미터 바인딩 사용 (GET)
  /vuln-post     취약 : POST 방식, 입력값을 쿼리에 직접 연결
  /vuln-id       취약 : 숫자 id를 쿼리에 직접 연결
  /safe-id       안전 : 숫자 id를 파라미터 바인딩
  /vuln-blind    취약 : 입력값을 쿼리에 직접 연결하지만, 결과·오류를 화면에 보여주지 않음
                        (Blind SQL Injection, 현재 탐지 방식의 한계 확인용)

[XSS]
  /echo          취약 : 입력값을 인코딩 없이 출력
  /escape        안전 : HTML 인코딩 후 출력
  /echo-attr     취약 : 입력값을 태그 속성 안에 인코딩 없이 출력
  /safe-filter   안전 : 위험 문자를 제거한 뒤 출력

※ 교육용으로 일부러 취약하게 만든 서버이므로 127.0.0.1에서만 실행하세요.
"""

import html
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs


HOST = "127.0.0.1"
PORT = 8001


# ── 테스트용 DB (메모리에만 존재, 서버를 끄면 사라짐) ──────────────
def create_db():
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.execute(
        "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT)"
    )
    conn.executemany(
        "INSERT INTO users (username, email) VALUES (?, ?)",
        [
            ("alice", "alice@test.local"),
            ("bob", "bob@test.local"),
            ("charlie", "charlie@test.local"),
        ],
    )
    conn.commit()
    return conn


DB = create_db()


# ── 검색 로직 ─────────────────────────────────────────────────────
def search_vulnerable(username):
    # [취약] 사용자 입력을 SQL 문자열에 그대로 이어 붙임
    query = f"SELECT username, email FROM users WHERE username = '{username}'"
    return DB.execute(query).fetchall()


def search_safe(username):
    # [안전] ? 자리표시자로 입력값을 데이터로만 전달
    query = "SELECT username, email FROM users WHERE username = ?"
    return DB.execute(query, (username,)).fetchall()


def search_by_id_vulnerable(user_id):
    # [취약] 숫자 자리에 입력값을 그대로 연결 (따옴표 없이)
    query = f"SELECT username, email FROM users WHERE id = {user_id}"
    return DB.execute(query).fetchall()


def search_by_id_safe(user_id):
    # [안전] 숫자도 파라미터 바인딩으로 전달
    query = "SELECT username, email FROM users WHERE id = ?"
    return DB.execute(query, (user_id,)).fetchall()


def check_blind(username):
    # [취약] 입력값을 쿼리에 직접 연결하지만,
    #        조회 결과와 오류를 사용자에게 전혀 보여주지 않음 (Blind)
    query = f"SELECT username FROM users WHERE username = '{username}'"
    try:
        DB.execute(query).fetchall()
    except sqlite3.Error:
        pass  # 오류도 숨김


# ── HTML 렌더링 ───────────────────────────────────────────────────
def page(title, body):
    return f"""<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>{html.escape(title)}</title></head>
<body>
<h1>{html.escape(title)}</h1>
{body}
<p><a href="/">← 메인으로</a></p>
</body>
</html>"""


def render_rows(rows):
    if not rows:
        return "<p>검색 결과가 없습니다.</p>"
    items = "".join(
        f"<tr><td>{html.escape(str(u))}</td><td>{html.escape(str(e))}</td></tr>"
        for u, e in rows
    )
    return (
        f"<p>검색 결과: {len(rows)}건</p>"
        f"<table border='1'><tr><th>username</th><th>email</th></tr>{items}</table>"
    )


def db_error_page(error):
    # [취약] DB 오류 내용을 사용자에게 그대로 노출
    detail = html.escape(f"{type(error).__module__}.{type(error).__name__}: {error}")
    return page("Database Error", f"<pre>{detail}</pre>")


INDEX_HTML = """<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>Security Test Website</title></head>
<body>
<h1>웹 취약점 진단 테스트 페이지</h1>

<h2>SQL Injection</h2>
<form method="GET" action="/vuln"><input type="text" name="username"><button>취약 검색(GET)</button></form>
<form method="GET" action="/safe"><input type="text" name="username"><button>안전 검색</button></form>
<form method="POST" action="/vuln-post"><input type="text" name="username"><button>취약 검색(POST)</button></form>
<form method="GET" action="/vuln-id"><input type="text" name="id"><button>취약 id 검색</button></form>
<form method="GET" action="/safe-id"><input type="text" name="id"><button>안전 id 검색</button></form>
<form method="GET" action="/vuln-blind"><input type="text" name="username"><button>취약 가입 확인(Blind)</button></form>

<h2>XSS</h2>
<form method="GET" action="/echo"><input type="text" name="q"><button>취약 출력</button></form>
<form method="GET" action="/escape"><input type="text" name="q"><button>안전 출력</button></form>
<form method="GET" action="/echo-attr"><input type="text" name="q"><button>취약 속성 출력</button></form>
<form method="GET" action="/safe-filter"><input type="text" name="q"><button>필터 출력</button></form>
</body>
</html>"""


# ── 요청 처리 ─────────────────────────────────────────────────────
class SecurityTestHandler(BaseHTTPRequestHandler):

    def send_html(self, status, content):
        data = content.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    # GET/POST 공통 처리
    def handle_request(self, params):
        parsed = urlparse(self.path)
        username = params.get("username", [""])[0]
        message = params.get("q", [""])[0]
        user_id = params.get("id", [""])[0]
        path = parsed.path

        # ── SQL Injection ──
        if path == "/vuln" or path == "/vuln-post":
            try:
                rows = search_vulnerable(username)
                self.send_html(200, page("취약한 검색 결과", render_rows(rows)))
            except sqlite3.Error as error:
                self.send_html(500, db_error_page(error))

        elif path == "/safe":
            try:
                rows = search_safe(username)
                self.send_html(200, page("안전한 검색 결과", render_rows(rows)))
            except sqlite3.Error:
                self.send_html(500, page("오류", "<p>요청을 처리할 수 없습니다.</p>"))

        elif path == "/vuln-id":
            try:
                rows = search_by_id_vulnerable(user_id)
                self.send_html(200, page("취약한 id 검색 결과", render_rows(rows)))
            except sqlite3.Error as error:
                self.send_html(500, db_error_page(error))

        elif path == "/safe-id":
            try:
                rows = search_by_id_safe(user_id)
                self.send_html(200, page("안전한 id 검색 결과", render_rows(rows)))
            except sqlite3.Error:
                self.send_html(500, page("오류", "<p>요청을 처리할 수 없습니다.</p>"))

        elif path == "/vuln-blind":
            # 무엇을 입력해도 항상 같은 응답 → 화면만으로는 차이를 알 수 없음
            check_blind(username)
            self.send_html(200, page("가입 확인", "<p>요청이 접수되었습니다.</p>"))

        # ── XSS ──
        elif path == "/echo":
            # [취약] 입력값을 본문에 인코딩 없이 삽입
            body = f"<p>입력하신 메시지: {message}</p>"
            self.send_html(200, page("메시지 출력", body))

        elif path == "/escape":
            # [안전] HTML 인코딩 후 삽입
            body = f"<p>입력하신 메시지: {html.escape(message)}</p>"
            self.send_html(200, page("메시지 출력", body))

        elif path == "/echo-attr":
            # [취약] 입력값을 태그 속성값 안에 인코딩 없이 삽입
            body = f'<input type="text" value="{message}">'
            self.send_html(200, page("속성 출력", body))

        elif path == "/safe-filter":
            # [안전] 위험 문자(< > " ')를 제거한 뒤 출력
            cleaned = message.replace("<", "").replace(">", "").replace('"', "").replace("'", "")
            body = f"<p>입력하신 메시지: {cleaned}</p>"
            self.send_html(200, page("필터 출력", body))

        elif path == "/":
            self.send_html(200, INDEX_HTML)

        else:
            self.send_html(404, page("Not Found", "<p>페이지를 찾을 수 없습니다.</p>"))

    def do_GET(self):
        params = parse_qs(urlparse(self.path).query)
        self.handle_request(params)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8")
        self.handle_request(parse_qs(body))

    def log_message(self, fmt, *args):
        print(f"[요청] {self.address_string()} {fmt % args}")


def run_server():
    server = ThreadingHTTPServer((HOST, PORT), SecurityTestHandler)
    print("Guardians 테스트 서버 실행 중")
    print(f"주소: http://{HOST}:{PORT}")
    print("종료하려면 Ctrl + C를 누르세요.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n테스트 서버 종료")
    finally:
        server.server_close()


if __name__ == "__main__":
    run_server()