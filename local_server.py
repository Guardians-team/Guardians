"""
로컬 전용 테스트 서버

  /         : 모든 테스트 폼이 모인 메인 페이지 (스캐너 시작 위치)
  /vuln     : 취약한 SQL 검색 (입력값을 쿼리 문자열에 직접 연결)
  /safe     : 안전한 SQL 검색 (파라미터 바인딩 사용)
  /echo     : 취약한 출력 (입력값을 인코딩 없이 그대로 노출 → XSS)
  /escape   : 안전한 출력 (입력값을 HTML 인코딩하여 노출)

※ 교육용으로 일부러 취약하게 만든 서버이므로 127.0.0.1에서만 실행하세요.
"""

import html
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
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
        f"<tr><td>{html.escape(u)}</td><td>{html.escape(e)}</td></tr>"
        for u, e in rows
    )
    return (
        f"<p>검색 결과: {len(rows)}건</p>"
        f"<table border='1'><tr><th>username</th><th>email</th></tr>{items}</table>"
    )


INDEX_HTML = """<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>Security Test Website</title></head>
<body>
<h1>웹 취약점 진단 테스트 페이지</h1>

<h2>취약한 사용자 검색 (SQL Injection)</h2>
<form method="GET" action="/vuln">
    <input type="text" name="username">
    <button type="submit">검색</button>
</form>

<h2>안전한 사용자 검색</h2>
<form method="GET" action="/safe">
    <input type="text" name="username">
    <button type="submit">검색</button>
</form>

<h2>취약한 메시지 출력 (XSS)</h2>
<form method="GET" action="/echo">
    <input type="text" name="q">
    <button type="submit">출력</button>
</form>

<h2>안전한 메시지 출력</h2>
<form method="GET" action="/escape">
    <input type="text" name="q">
    <button type="submit">출력</button>
</form>
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

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        username = params.get("username", [""])[0]
        message = params.get("q", [""])[0]

        if parsed.path == "/":
            self.send_html(200, INDEX_HTML)

        elif parsed.path == "/vuln":
            try:
                rows = search_vulnerable(username)
                self.send_html(200, page("취약한 검색 결과", render_rows(rows)))
            except sqlite3.Error as error:
                # [취약] DB 오류 내용을 사용자에게 그대로 노출
                detail = html.escape(
                    f"{type(error).__module__}.{type(error).__name__}: {error}"
                )
                self.send_html(500, page("Database Error", f"<pre>{detail}</pre>"))

        elif parsed.path == "/safe":
            try:
                rows = search_safe(username)
                self.send_html(200, page("안전한 검색 결과", render_rows(rows)))
            except sqlite3.Error:
                # [안전] 일반화된 오류 메시지만 표시
                self.send_html(500, page("오류", "<p>요청을 처리할 수 없습니다.</p>"))

        elif parsed.path == "/echo":
            # [취약] 입력값을 인코딩 없이 그대로 HTML에 삽입 → Reflected XSS
            body = f"<p>입력하신 메시지: {message}</p>"
            self.send_html(200, page("메시지 출력", body))

        elif parsed.path == "/escape":
            # [안전] 입력값을 HTML 인코딩하여 삽입
            body = f"<p>입력하신 메시지: {html.escape(message)}</p>"
            self.send_html(200, page("메시지 출력", body))

        else:
            self.send_html(404, page("Not Found", "<p>페이지를 찾을 수 없습니다.</p>"))

    def log_message(self, fmt, *args):
        print(f"[요청] {self.address_string()} {fmt % args}")


def run_server():
    server = HTTPServer((HOST, PORT), SecurityTestHandler)
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