from http.server import BaseHTTPRequestHandler, HTTPServer


class TestHandler(BaseHTTPRequestHandler):

    def do_GET(self):

        html = """
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>Security Test Website</title>
        </head>
        <body>
            <h1>웹 취약점 진단 테스트 페이지</h1>

            <p>로컬 테스트 서버가 정상적으로 실행되었습니다.</p>

            <h2>테스트 입력 폼</h2>

            <form method="GET" action="/">
                <label>사용자 이름:</label>
                <input type="text" name="username">

                <button type="submit">전송</button>
            </form>
        </body>
        </html>
        """

        self.send_response(200)
        self.send_header(
            "Content-Type",
            "text/html; charset=utf-8"
        )
        self.end_headers()

        self.wfile.write(html.encode("utf-8"))


server = HTTPServer(
    ("127.0.0.1", 5000),
    TestHandler
)

print("테스트 서버 실행 중")
print("주소: http://127.0.0.1:5000")
print("종료하려면 Ctrl + C를 누르세요.")

server.serve_forever()