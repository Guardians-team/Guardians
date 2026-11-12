// KPI 카드 오른쪽 아래의 작은 추세선. values 는 오래된 것 → 최신 순서입니다.
export default function Sparkline({ id, values }) {
  const w = 104, h = 48, pad = 5;
  const vals = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const max = Math.max(...vals), min = Math.min(...vals);
  const points = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const ratio = max === min ? 0.5 : (v - min) / (max - min);
    return `${x.toFixed(1)} ${(h - pad - ratio * (h - pad * 2 - 8)).toFixed(1)}`;
  });
  const line = `M${points.join(" L")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="absolute bottom-1 right-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--spark)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--spark)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="var(--spark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
