import { SEVERITIES, formatDate, locationOf, withIds } from "../lib/format.js";
import { countBy } from "../lib/stats.js";

/**
 * PDF 내려받기용 리포트. 화면에서는 숨겨져 있고 인쇄할 때만 나타납니다.
 * 테마와 무관하게 항상 흰 종이 기준 색을 씁니다.
 */
const cell = { border: "1px solid #c9d0db", padding: "6px 10px", fontSize: 12, verticalAlign: "top", textAlign: "left" };
const head = { ...cell, background: "#eef1f6", fontWeight: 600, width: 110, whiteSpace: "nowrap" };

export default function PrintReport({ scan, author }) {
  const findings = withIds(scan.findings);
  const counts = countBy(findings, "severity");

  return (
    <div className="print-only" style={{ color: "#111", fontFamily: '"Noto Sans KR", "Malgun Gothic", sans-serif' }}>
      <h1 style={{ fontSize: 22, margin: 0 }}>웹 취약점 진단 QA 결함 리포트</h1>
      <p style={{ fontSize: 12, color: "#444", margin: "6px 0 18px" }}>
        대상 {scan.target} / 진단 일시 {formatDate(scan.scan_date)} / 발견 항목 {findings.length}건
        {author ? ` / 작성 ${author}` : ""}
      </p>

      <table style={{ borderCollapse: "collapse", marginBottom: 22 }}>
        <thead>
          <tr>
            {SEVERITIES.map((s) => (
              <th key={s} style={{ ...cell, background: "#eef1f6", fontWeight: 600, textAlign: "center" }}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {SEVERITIES.map((s) => (
              <td key={s} style={{ ...cell, textAlign: "center", fontSize: 14 }}>{counts[s] || 0}</td>
            ))}
          </tr>
        </tbody>
      </table>

      {findings.length === 0 && <p style={{ fontSize: 13 }}>탐지된 취약점이 없습니다.</p>}

      {findings.map((f) => (
        <table key={f.id} style={{ borderCollapse: "collapse", width: "100%", marginBottom: 14, breakInside: "avoid" }}>
          <tbody>
            <tr><th style={head}>{f.id}</th><td style={{ ...cell, fontWeight: 600, fontSize: 13 }}>{f.title}</td></tr>
            <tr><th style={head}>유형 / 위험도</th><td style={cell}>{f.type} / {f.severity} / {f.status}</td></tr>
            <tr><th style={head}>위치</th><td style={cell}>{locationOf(f) || "-"}</td></tr>
            <tr><th style={head}>재현 절차</th><td style={{ ...cell, whiteSpace: "pre-line" }}>{f.steps || "-"}</td></tr>
            <tr><th style={head}>기대 결과</th><td style={cell}>{f.expected || "-"}</td></tr>
            <tr><th style={head}>실제 결과</th><td style={cell}>{[f.actual, f.evidence].filter(Boolean).join(" / ") || "-"}</td></tr>
            <tr><th style={head}>개선 권고</th><td style={cell}>{f.recommendation || "-"}</td></tr>
          </tbody>
        </table>
      ))}
    </div>
  );
}
