// 위험도 순서와 색(CSS 변수 이름)을 한 곳에서 관리합니다.
export const SEVERITIES = ["Critical", "High", "Medium", "Low"];

const KEY = { Critical: "crit", High: "high", Medium: "med", Low: "low", Informational: "low" };

export function sevVars(severity) {
  const key = KEY[severity] ?? "low";
  return {
    color: `var(--sev-${key})`,
    top: `var(--sev-${key}-top)`,
    text: `var(--sev-${key}-text)`,
    soft: `var(--sev-${key}-soft)`,
  };
}

// "2026-11-14T21:30:00" → "2026.11.14 21:30"
export function formatDate(iso) {
  if (!iso) return "-";
  return iso.slice(0, 16).replace("T", " ").replace(/-/g, ".");
}

export function locationOf(finding) {
  return [finding.location, finding.parameter].filter(Boolean).join(" · ");
}

// 스캐너 결과에는 ID가 없으므로 reporter.py 와 같은 규칙(VUL-001…)으로 붙입니다.
export function withIds(findings = []) {
  return findings.map((f, i) => ({ ...f, id: `VUL-${String(i + 1).padStart(3, "0")}` }));
}

export function signed(n, unit = "") {
  if (n === 0) return "변동 없음";
  return `${n > 0 ? "▲ +" : "▼ "}${n}${unit}`;
}
