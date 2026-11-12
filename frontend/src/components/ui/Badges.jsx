import { sevVars } from "../../lib/format.js";

export function SeverityBadge({ severity }) {
  const c = sevVars(severity);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[13px] font-semibold"
      style={{ background: c.soft, color: c.text }}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
      {severity}
    </span>
  );
}

// 검증 상태는 색뿐 아니라 테두리 모양으로도 구분됩니다 (채움 / 실선 / 점선).
const STATUS_CLASS = {
  Confirmed: "border-accent bg-accent text-white",
  Potential: "border-soft text-soft",
  "Needs Review": "border-dashed border-soft text-soft",
  "Not Detected": "border-line text-soft",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[13px] font-medium ${STATUS_CLASS[status] || STATUS_CLASS.Potential}`}>
      {status}
    </span>
  );
}

export function DoneBadge() {
  return (
    <span className="inline-block whitespace-nowrap rounded-md px-3 py-0.5 text-[13px] font-semibold" style={{ background: "var(--ok-bg)", color: "var(--ok-text)" }}>
      완료
    </span>
  );
}
