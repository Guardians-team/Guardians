import { useState } from "react";
import { GitCompare, Target } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { formatDate, locationOf } from "../lib/format.js";
import { diffScans, evaluate } from "../lib/stats.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import ScanSelect from "../components/ui/ScanSelect.jsx";
import { SeverityBadge } from "../components/ui/Badges.jsx";

function Stat({ label, value, note }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-thead px-5 py-4">
      <span className="text-sm font-medium text-soft">{label}</span>
      <span className="text-[28px] font-extrabold tracking-tight">{value}</span>
      <span className="text-[13px] text-soft">{note}</span>
    </div>
  );
}

// 판정: 정답(취약/안전)과 탐지 여부를 비교
function verdict(c) {
  if (c.expected === "vulnerable") return c.detected ? { text: "정탐", ok: true } : { text: "미탐", ok: false };
  return c.detected ? { text: "오탐", ok: false } : { text: "정상", ok: true };
}

function Accuracy({ evaluation }) {
  if (!evaluation?.cases?.length) {
    return (
      <p className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm leading-relaxed text-soft">
        아직 평가 결과가 없습니다. 취약/안전 테스트 페이지를 진단한 결과를
        <br />
        reports/evaluation.json 에 저장하면 여기에 탐지율과 오탐률이 표시됩니다.
      </p>
    );
  }
  const r = evaluate(evaluation.cases);
  return (
    <>
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <Stat label="탐지율" value={`${r.detectionRate}%`} note={`취약 페이지 ${r.vulnerableTotal}개 중 ${r.tp}개 탐지`} />
        <Stat label="오탐률" value={`${r.falsePositiveRate}%`} note={`안전 페이지 ${r.safeTotal}개 중 ${r.fp}개 오탐`} />
        <Stat label="미탐" value={`${r.fn}건`} note="취약하지만 놓친 페이지" />
        <Stat label="평가 일시" value={formatDate(evaluation.evaluated_at).slice(5)} note={`테스트 페이지 ${evaluation.cases.length}개`} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="bg-thead">
              <th className="th rounded-l-lg">테스트 페이지</th>
              <th className="th">점검 유형</th>
              <th className="th">정답</th>
              <th className="th">탐지 결과</th>
              <th className="th rounded-r-lg">판정</th>
            </tr>
          </thead>
          <tbody>
            {evaluation.cases.map((c) => {
              const v = verdict(c);
              return (
                <tr key={`${c.page}-${c.type}`} className="border-b border-line last:border-b-0">
                  <td className="td py-3 font-medium">{c.page}</td>
                  <td className="td">{c.type}</td>
                  <td className="td">{c.expected === "vulnerable" ? "취약" : "안전"}</td>
                  <td className="td">{c.detected ? "탐지됨" : "탐지 안 됨"}</td>
                  <td className="td">
                    <span className="rounded-md px-2.5 py-0.5 text-[13px] font-semibold"
                      style={v.ok ? { background: "var(--ok-bg)", color: "var(--ok-text)" } : { background: "var(--pdf-bg)", color: "var(--pdf-text)" }}>
                      {v.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DiffColumn({ title, note, items, tone }) {
  const tones = {
    bad: { background: "var(--pdf-bg)", color: "var(--pdf-text)" },
    good: { background: "var(--ok-bg)", color: "var(--ok-text)" },
    flat: { background: "var(--thead)", color: "var(--soft)" },
  };
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-line p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold">{title}</h3>
        <span className="rounded-md px-2.5 py-0.5 text-[13px] font-bold" style={tones[tone]}>{items.length}건</span>
      </div>
      <p className="text-[13px] text-soft">{note}</p>
      {items.length === 0 ? (
        <p className="py-3 text-sm text-soft">해당 항목 없음</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((f, i) => (
            <li key={i} className="flex flex-col gap-1.5 rounded-lg bg-thead px-3 py-2.5">
              <span className="text-sm font-semibold">{f.title}</span>
              <span className="flex flex-wrap items-center gap-2 text-[13px] text-soft">
                <SeverityBadge severity={f.severity} />
                {locationOf(f)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Analysis() {
  const { scans, evaluation } = useApp();
  // 기본값: 최신 진단(비교) ↔ 같은 대상을 진단한 바로 이전 기록(기준)
  const sameTarget = scans.slice(1).find((s) => s.target === scans[0]?.target);
  const [beforeId, setBeforeId] = useState((sameTarget ?? scans[1] ?? scans[0])?.id ?? "");
  const [afterId, setAfterId] = useState(scans[0]?.id ?? "");
  const before = scans.find((s) => s.id === beforeId);
  const after = scans.find((s) => s.id === afterId);
  const diff = diffScans(before, after);

  return (
    <>
      <PageHeader title="진단 분석" description="탐지 정확도를 검증하고, 진단 사이에 무엇이 달라졌는지 비교합니다." />

      <section className="card flex flex-col gap-4 p-6">
        <h2 className="card-title"><Target size={21} className="text-accent" aria-hidden="true" />탐지 정확도</h2>
        <p className="text-sm text-soft">
          취약하게 만든 페이지는 잡아내고, 안전하게 만든 페이지는 잡지 않는지 확인한 결과입니다.
        </p>
        <Accuracy evaluation={evaluation} />
      </section>

      <section className="card flex flex-col gap-4 p-6">
        <h2 className="card-title"><GitCompare size={21} className="text-accent" aria-hidden="true" />진단 비교</h2>
        {scans.length < 2 ? (
          <p className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-soft">
            진단 기록이 2건 이상 있어야 비교할 수 있습니다.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4">
              <ScanSelect id="diff-before" label="기준 진단 (이전)" scans={scans} value={beforeId} onChange={setBeforeId} />
              <ScanSelect id="diff-after" label="비교 진단 (이후)" scans={scans} value={afterId} onChange={setAfterId} />
            </div>
            <div className="grid gap-3.5 lg:grid-cols-3">
              <DiffColumn title="새로 발견" note="이전에는 없었고 이후 진단에서 나온 결함" items={diff.added} tone="bad" />
              <DiffColumn title="해결됨" note="이전에는 있었지만 이후 진단에서 사라진 결함" items={diff.resolved} tone="good" />
              <DiffColumn title="유지" note="두 진단 모두에서 발견된 결함" items={diff.unchanged} tone="flat" />
            </div>
          </>
        )}
      </section>
    </>
  );
}
