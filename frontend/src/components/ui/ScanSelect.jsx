import { formatDate } from "../../lib/format.js";

// 진단 기록 중 하나를 고르는 선택 상자
export default function ScanSelect({ id, label, scans, value, onChange }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-soft">{label}</label>
      <select id={id} className="input min-w-[260px] cursor-pointer" value={value} onChange={(e) => onChange(e.target.value)}>
        {scans.map((s) => (
          <option key={s.id} value={s.id}>
            {formatDate(s.scan_date)} · {s.target} ({s.findings.length}건)
          </option>
        ))}
      </select>
    </div>
  );
}
