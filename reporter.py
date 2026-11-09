from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter


HEADERS = [
    "Defect ID",
    "Defect Title",
    "Vulnerability Type",
    "Severity",
    "Status",
    "Affected URL",
    "Steps to Reproduce",
    "Expected Result",
    "Actual Result / Evidence",
    "Recommendation",
    "Scan Date"
]


def generate_report(scan_result, output_path):

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    wb = Workbook()
    ws = wb.active
    ws.title = "QA Defect Report"

    ws.append(HEADERS)

    findings = scan_result.get("findings", [])

    for idx, finding in enumerate(findings, start=1):

        ws.append([
            f"VUL-{idx:03d}",
            finding.get("title", ""),
            finding.get("type", ""),
            finding.get("severity", ""),
            finding.get("status", ""),
            finding.get("location", ""),
            "로컬 테스트 환경에서 동일한 점검 수행",
            "보안 설정 및 출력 처리가 안전하게 적용되어야 함",
            finding.get("evidence", ""),
            finding.get("recommendation", ""),
            scan_result.get("scan_date", "")
        ])

    # 헤더 스타일
    header_fill = PatternFill(
        "solid",
        fgColor="1F4E78"
    )

    for cell in ws[1]:
        cell.font = Font(
            color="FFFFFF",
            bold=True
        )
        cell.fill = header_fill
        cell.alignment = Alignment(
            horizontal="center",
            vertical="center"
        )

    # 열 너비 설정
    widths = [
        14, 36, 24, 14, 18,
        34, 48, 42, 55, 55, 25
    ]

    for col, width in enumerate(widths, start=1):
        ws.column_dimensions[
            get_column_letter(col)
        ].width = width

    # 셀 줄바꿈
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(
                vertical="top",
                wrap_text=True
            )

    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions

    # 점검 요약 시트
    summary = wb.create_sheet("Scan Summary")

    summary.append(["Item", "Value"])
    summary.append(["Target", scan_result.get("target", "")])
    summary.append(["Scan Date", scan_result.get("scan_date", "")])
    summary.append(["HTTP Status", scan_result.get("http_status", "")])
    summary.append(["Forms Found", len(scan_result.get("forms_found", []))])
    summary.append(["Findings", len(findings)])

    summary.column_dimensions["A"].width = 24
    summary.column_dimensions["B"].width = 80

    for cell in summary[1]:
        cell.font = Font(color="FFFFFF", bold=True)
        cell.fill = header_fill

    wb.save(output_path)

    return output_path