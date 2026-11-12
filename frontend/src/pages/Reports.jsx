import { FileText } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { formatDate, sevVars } from "../lib/format.js";
import { summarize } from "../lib/stats.js";
import PageHeader, { EmptyState } from "../components/ui/PageHeader.jsx";
import ReportButtons from "../components/ui/ReportButtons.jsx";

export default function Reports() {
  const { scans, source } = useApp();

  return (
    <>
      <PageHeader title="리포트 관리" description="진단별 QA 결함 리포트를 Excel 또는 PDF로 내려받습니다." />

      <section className="card grid gap-4 p-6 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold" style={{ color: "var(--xls-text)" }}>Excel (.xlsx)</h2>
          <p className="text-sm leading-relaxed text-soft">
            결함 ID, 재현 절차, 기대/실제 결과가 정리된 작업용 목록입니다. 필터와 정렬로 결함을 관리할 때 씁니다.
            {source === "mock" && " (API 미연결 상태에서는 Excel에서 열리는 .csv 로 저장됩니다.)"}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold" style={{ color: "var(--pdf-text)" }}>PDF</h2>
          <p className="text-sm leading-relaxed text-soft">
            제출과 공유를 위한 보고용 문서입니다. 버튼을 누르면 인쇄 창이 열리고, 대상에서 "PDF로 저장"을 선택하면 됩니다.
          </p>
        </div>
      </section>

      {scans.length === 0 ? (
        <EmptyState title="내려받을 리포트가 없습니다">진단을 실행하면 리포트가 여기에 생깁니다.</EmptyState>
      ) : (
        <section className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          {scans.map((scan) => {
            const s = summarize(scan);
            return (
              <article key={scan.id} className="card flex flex-col gap-4 p-5">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tile text-accent">
                    <FileText size={22} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold">{formatDate(scan.scan_date)} 진단 리포트</h2>
                    <p className="truncate text-sm text-soft">{scan.target}</p>
                  </div>
                </div>
                <ul className="grid grid-cols-4 gap-2">
                  {s.bySeverity.map((d) => {
                    const c = sevVars(d.label);
                    return (
                      <li key={d.label} className="flex flex-col items-center rounded-lg py-2" style={{ background: c.soft }}>
                        <span className="text-lg font-extrabold" style={{ color: c.text }}>{d.count}</span>
                        <span className="text-xs font-semibold" style={{ color: c.text }}>{d.label}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-soft">결함 {s.total}건, 검증 완료 {s.confirmed}건</span>
                  <ReportButtons scan={scan} size="lg" />
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
