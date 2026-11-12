import { locationOf, withIds } from "./format.js";

// Excel: API 연결 시 reporter.py 가 만든 .xlsx 를 내려받습니다.
//        미연결(예시 데이터) 상태에서는 Excel 에서 열리는 .csv 로 대신 저장합니다.
export function downloadExcel(scan, source) {
  if (source === "api") {
    window.location.href = `/api/scans/${scan.id}/report.xlsx`;
    return;
  }
  const header = [
    "Defect ID", "Defect Title", "Vulnerability Type", "Severity", "Status",
    "Affected URL", "Steps to Reproduce", "Expected Result", "Actual Result / Evidence",
    "Recommendation", "Scan Date",
  ];
  const rows = withIds(scan.findings).map((f) => [
    f.id, f.title, f.type, f.severity, f.status, locationOf(f),
    f.steps || "", f.expected || "",
    [f.actual, f.evidence].filter(Boolean).join(" / "),
    f.recommendation || "", scan.scan_date || "",
  ]);
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  // BOM(\uFEFF)을 붙여야 Excel 에서 한글이 깨지지 않습니다.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `qa_defect_report_${scan.id}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
// PDF 는 AppContext 의 printScan(scan) 을 씁니다. (인쇄 창 → "PDF로 저장")
