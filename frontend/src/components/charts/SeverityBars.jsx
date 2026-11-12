import { sevVars } from "../../lib/format.js";

// 위험도별 막대 차트. data: [{ label: "Critical", count }]
const PLOT_HEIGHT = 172;

export default function SeverityBars({ data }) {
  const max = Math.max(...data.map((d) => d.count), 0);
  const top = Math.max(5, Math.ceil(max / 5) * 5);   // 눈금 최댓값 (5, 10, 15 …)
  const step = top / 5;
  const ticks = [5, 4, 3, 2, 1, 0].map((i) => i * step);
  const summary = data.map((d) => `${d.label} ${d.count}`).join(", ");

  return (
    <div role="img" aria-label={`위험도별 발견 수: ${summary}`} className="flex gap-2.5 pt-1.5">
      <div className="flex w-5 -translate-y-2 flex-col justify-between text-right text-xs text-soft" style={{ height: PLOT_HEIGHT + 8 }}>
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div
          className="grid items-end gap-4 px-3 sm:gap-[34px] sm:px-[22px]"
          style={{
            height: PLOT_HEIGHT,
            gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
            borderLeft: "1px solid var(--axis)",
            borderBottom: "1px solid var(--axis)",
            backgroundImage: "linear-gradient(var(--grid) 1px, transparent 1px)",
            backgroundSize: `100% ${PLOT_HEIGHT / 5}px`,
            backgroundPosition: "0 -1px",
          }}
        >
          {data.map((d) => {
            const c = sevVars(d.label);
            return (
              <div key={d.label} className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold">{d.count}</span>
                <div
                  className="w-full max-w-[88px] rounded-t"
                  style={{ height: (d.count / top) * (PLOT_HEIGHT - 26), background: `linear-gradient(180deg, ${c.top}, ${c.color})` }}
                />
              </div>
            );
          })}
        </div>
        <div className="grid gap-4 px-3 sm:gap-[34px] sm:px-[22px]" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
          {data.map((d) => (
            <span key={d.label} className="text-center text-sm font-medium">{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
