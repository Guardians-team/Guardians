// 취약점 유형별 도넛 차트 + 범례. segments: [{ label, count }] (건수 많은 순)
const R = 78;
const C = 2 * Math.PI * R;

export default function Donut({ segments, centerLabel = "전체 취약점" }) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  let offset = 0;
  const arcs = segments.map((s, i) => {
    const length = total ? (s.count / total) * C : 0;
    const arc = {
      ...s,
      color: `var(--donut-${Math.min(i + 1, 5)})`,
      pct: total ? `${((s.count / total) * 100).toFixed(1)}%` : "0%",
      dash: `${Math.max(length - 2.5, 0)} ${C}`,
      offset: -offset,
    };
    offset += length;
    return arc;
  });
  const summary = arcs.map((a) => `${a.label} ${a.count}건`).join(", ");

  return (
    <div className="flex flex-wrap items-center gap-7 py-1.5 sm:pl-2">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label={`취약점 유형 비율: ${summary || "없음"}`}>
          <g transform="rotate(-90 100 100)">
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--grid)" strokeWidth="36" />
            {arcs.map((a) => (
              <circle key={a.label} cx="100" cy="100" r={R} fill="none" stroke={a.color} strokeWidth="36" strokeDasharray={a.dash} strokeDashoffset={a.offset} />
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[34px] font-extrabold leading-none">{total}</span>
          <span className="mt-1.5 text-[13px] font-medium">{centerLabel}</span>
        </div>
      </div>
      <ul className="flex min-w-0 flex-[1_1_220px] flex-col gap-[18px]">
        {arcs.length === 0 && <li className="text-sm text-soft">탐지된 취약점이 없습니다.</li>}
        {arcs.map((a) => (
          <li key={a.label} className="grid grid-cols-[14px_minmax(0,1fr)_auto_52px] items-center gap-2.5 text-[15px]">
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: a.color }} />
            <span className="[word-break:keep-all]">{a.label}</span>
            <span className="text-right font-medium">{a.count}</span>
            <span className="text-right text-soft">{a.pct}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
