"""
대시보드용 API 서버 (Flask)

  GET    /api/scans                    전체 진단 기록 (최신순)
  GET    /api/scans/<id>               진단 1건
  POST   /api/scan                     {"target": "http://127.0.0.1:5000"} 진단 실행
  DELETE /api/scans/<id>               진단 기록 삭제
  GET    /api/scans/<id>/report.xlsx   엑셀 QA 결함 리포트
  GET    /api/rules                    탐지 규칙 (payloads.json)
  GET    /api/evaluation               탐지 정확도 평가 결과 (reports/evaluation.json)

실행:  python api.py   (http://127.0.0.1:8000)
※ 테스트 서버(test_server.py)가 5000번을 쓰므로 API는 8000번을 사용합니다.
"""

import json
import re
from datetime import datetime
from pathlib import Path

import requests
from flask import Flask, jsonify, request, send_file

from scanner import scan
from reporter import generate_report


BASE_DIR = Path(__file__).resolve().parent
REPORT_DIR = BASE_DIR / "reports"
SCAN_DIR = REPORT_DIR / "scans"
EVALUATION_FILE = REPORT_DIR / "evaluation.json"
PAYLOAD_FILE = BASE_DIR / "payloads.json"

# 진단 ID는 "20261114-213000" 형식만 허용 (파일 경로 조작 방지)
SCAN_ID_PATTERN = re.compile(r"^\d{8}-\d{6}$")

app = Flask(__name__)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def scan_path(scan_id):
    if not SCAN_ID_PATTERN.match(scan_id):
        return None
    path = SCAN_DIR / f"{scan_id}.json"
    return path if path.exists() else None


def not_found(message="진단 기록을 찾을 수 없습니다."):
    return jsonify({"error": message}), 404


@app.get("/api/scans")
def list_scans():
    if not SCAN_DIR.exists():
        return jsonify([])
    files = sorted(SCAN_DIR.glob("*.json"), reverse=True)
    return jsonify([read_json(path) for path in files])


@app.get("/api/scans/<scan_id>")
def get_scan(scan_id):
    path = scan_path(scan_id)
    if path is None:
        return not_found()
    return jsonify(read_json(path))


@app.post("/api/scan")
def run_scan():
    data = request.get_json(silent=True) or {}
    target = data.get("target", "").strip()
    mode = data.get("mode", "both")
    if not target:
        return jsonify({"error": "진단 대상 URL을 입력하세요."}), 400
    if mode not in ("static", "dynamic", "both"):
        mode = "both"

    try:
        result = scan(target, mode=mode)
    except ValueError as error:                 # localhost가 아닌 주소 등
        return jsonify({"error": str(error)}), 400
    except requests.RequestException:
        return jsonify({"error": "대상 서버에 연결할 수 없습니다. 테스트 서버가 켜져 있는지 확인하세요."}), 502

    result["id"] = datetime.now().strftime("%Y%m%d-%H%M%S")
    SCAN_DIR.mkdir(parents=True, exist_ok=True)
    (SCAN_DIR / f"{result['id']}.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return jsonify(result)


@app.delete("/api/scans/<scan_id>")
def delete_scan(scan_id):
    path = scan_path(scan_id)
    if path is None:
        return not_found()
    path.unlink()
    return jsonify({"deleted": scan_id})


@app.get("/api/scans/<scan_id>/report.xlsx")
def download_xlsx(scan_id):
    path = scan_path(scan_id)
    if path is None:
        return not_found()
    output = REPORT_DIR / f"qa_defect_report_{scan_id}.xlsx"
    generate_report(read_json(path), output)
    return send_file(output, as_attachment=True, download_name=output.name)


@app.get("/api/rules")
def rules():
    return jsonify(read_json(PAYLOAD_FILE))


@app.get("/api/evaluation")
def evaluation():
    if not EVALUATION_FILE.exists():
        return not_found("아직 정확도 평가 결과가 없습니다.")
    return jsonify(read_json(EVALUATION_FILE))


if __name__ == "__main__":
    # 로컬 전용: 외부에서 접근할 수 없도록 127.0.0.1에만 바인딩
    app.run(host="127.0.0.1", port=8000, debug=True)
