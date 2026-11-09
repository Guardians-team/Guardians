from pathlib import Path
from tempfile import TemporaryDirectory

from openpyxl import load_workbook

from reporter import generate_report


def test_reporter_creates_workbook():

    sample = {
        "target": "http://127.0.0.1:5000",
        "scan_date": "2026-11-09",
        "http_status": 200,
        "forms_found": [],
        "findings": []
    }

    with TemporaryDirectory() as temp_dir:

        output = Path(temp_dir) / "report.xlsx"

        generate_report(sample, output)

        assert output.exists()

        workbook = load_workbook(output)

        assert "QA Defect Report" in workbook.sheetnames
        assert "Scan Summary" in workbook.sheetnames