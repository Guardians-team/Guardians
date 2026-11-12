import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SeverityBadge, StatusBadge } from "./ui/Badges.jsx";
import { locationOf, sevVars } from "../lib/format.js";

const COLS = "md:grid-cols-[84px_minmax(0,1fr)_150px_112px_128px_24px]";

function Detail({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-4">
      <p className="text-[13px] font-bold text-soft">{label}</p>
      {children}
    </div>
  );
}

function Row({ f, open, onToggle }) {
  const c = sevVars(f.severity);
  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-5 py-3.5 text-left text-[14.5px] transition-colors hover:bg-thead ${COLS} ${open ? "bg-thead" : ""}`}
      >
        <span className="hidden text-[13px] text-soft md:block">{f.id}</span>
        <span className="col-start-1 row-start-1 min-w-0 md:col-auto md:row-auto">
          <span className="block truncate font-semibold">{f.title}</span>
          <span className="block truncate text-[13px] text-soft">{locationOf(f)}</span>
        </span>
        <span className="hidden text-sm text-soft md:block">{f.type}</span>
        <span className="col-start-1 row-start-2 md:col-auto md:row-auto">
          <SeverityBadge severity={f.severity} />
        </span>
        <span className="hidden md:block">
          <StatusBadge status={f.status} />
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`col-start-2 row-start-1 text-soft transition-transform md:col-auto md:row-auto ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="grid gap-3 bg-thead px-5 pb-5 pt-1 md:grid-cols-3">
          <Detail label="재현 절차">
            <p className="whitespace-pre-line text-sm text-soft">{f.steps || "기록 없음"}</p>
          </Detail>
          <Detail label="기대 결과 / 실제 결과">
            <p className="text-sm text-soft">{f.expected || "기록 없음"}</p>
            {f.actual && <p className="text-sm font-semibold" style={{ color: c.text }}>{f.actual}</p>}
          </Detail>
          <Detail label="탐지 근거 / 개선 권고">
            <p className="break-words text-sm text-soft">{f.evidence || "기록 없음"}</p>
            {f.recommendation && <p className="text-sm font-semibold text-ok">{f.recommendation}</p>}
            <p className="pt-1 md:hidden"><StatusBadge status={f.status} /></p>
          </Detail>
        </div>
      )}
    </li>
  );
}

// findings: withIds() 를 거친 목록
export default function FindingsTable({ findings, emptyText = "탐지된 취약점이 없습니다." }) {
  const [openId, setOpenId] = useState(findings[0]?.id ?? null);
  useEffect(() => setOpenId(findings[0]?.id ?? null), [findings]);

  if (findings.length === 0) {
    return <p className="px-5 py-12 text-center text-sm text-soft">{emptyText}</p>;
  }
  return (
    <>
      <div className={`hidden gap-x-3 bg-thead px-5 py-3 text-sm font-medium md:grid ${COLS}`}>
        <span>Defect ID</span>
        <span>결함 제목 / 위치</span>
        <span>유형</span>
        <span>위험도</span>
        <span>검증 상태</span>
        <span />
      </div>
      <ul>
        {findings.map((f) => (
          <Row key={f.id} f={f} open={openId === f.id} onToggle={() => setOpenId(openId === f.id ? null : f.id)} />
        ))}
      </ul>
    </>
  );
}
