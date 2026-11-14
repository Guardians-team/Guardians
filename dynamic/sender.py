"""
동적 분석용 폼 전송 도구

수집한 form 정보에 값을 채워 실제로 요청을 보내고, 응답을 돌려줍니다.
SQL Injection, XSS 등 모든 능동 탐지기가 공통으로 사용합니다.

이 모듈은 '요청을 보내고 응답을 받는' 일만 합니다.
무엇이 취약한지 판단하는 것은 각 탐지기(sqli.py, xss.py 등)의 몫입니다.
"""

from urllib.parse import urljoin


# 응답을 담아 탐지기에 넘기는 그릇.
# requests.Response 를 직접 넘기지 않고 꼭 필요한 값만 추려서,
# 탐지기 코드가 단순해지고 테스트하기도 쉬워집니다.
class Probe:
    def __init__(self, url, method, sent_values, response):
        self.url = url                    # 실제 요청한 주소
        self.method = method              # "GET" 또는 "POST"
        self.sent_values = sent_values    # 이번에 보낸 입력값 {이름: 값}
        self.status = response.status_code
        self.body = response.text
        self.elapsed = response.elapsed.total_seconds()

    def __repr__(self):
        return f"<Probe {self.method} {self.url} status={self.status}>"


def list_input_names(form):
    """form 에서 값을 넣을 수 있는 입력칸 이름만 추립니다."""
    names = []
    for item in form.get("inputs", []):
        name = item.get("name")
        input_type = (item.get("type") or "text").lower()
        # 이름이 없거나, 값을 넣을 수 없는 버튼류는 건너뜁니다.
        if name and input_type not in ("submit", "button", "reset", "image", "file"):
            names.append(name)
    return names


def build_values(form, target_name, payload, filler="test"):
    """
    form 의 모든 입력칸을 채운 값 묶음을 만듭니다.
    target_name 칸에는 payload 를, 나머지 칸에는 filler 를 넣습니다.

    한 칸만 payload 를 넣고 나머지도 채우는 이유: 빈 칸이 있으면
    서버가 "필수 입력" 오류를 내서, payload 와 무관한 응답이 나올 수 있습니다.
    """
    values = {}
    for name in list_input_names(form):
        values[name] = payload if name == target_name else filler
    return values


def send_form(session, base_url, form, values, timeout=8):
    """
    form 에 values 를 채워 한 번 요청하고 Probe 를 돌려줍니다.
    base_url 은 form 을 수집한 페이지 주소입니다(상대 경로 action 을 완성하는 데 씀).
    """
    # action 이 상대 경로("/search")거나 비어 있어도 절대 주소로 바꿉니다.
    action = form.get("action") or base_url
    url = urljoin(base_url, action)
    method = (form.get("method") or "GET").upper()

    if method == "POST":
        response = session.post(url, data=values, timeout=timeout, allow_redirects=False)
    else:
        response = session.get(url, params=values, timeout=timeout, allow_redirects=False)

    return Probe(url=response.url, method=method, sent_values=values, response=response)


def probe_field(session, base_url, form, field_name, payload, filler="test", timeout=8):
    """
    form 의 field_name 칸에 payload 를 넣어 한 번 요청하는 편의 함수.
    탐지기에서 '이 입력칸에 이 값을 넣어보고 응답을 보자'를 한 줄로 쓰게 해줍니다.
    """
    values = build_values(form, field_name, payload, filler=filler)
    return send_form(session, base_url, form, values, timeout=timeout)