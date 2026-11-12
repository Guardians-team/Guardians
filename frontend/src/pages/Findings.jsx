import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { SEVERITIES, withIds } from "../lib/format.js";
import PageHeader, { EmptyState } from "../components/ui/PageHeader.jsx";
import ScanSelect from "../components/ui/ScanSelect.jsx";
import ReportButtons from "../components/ui/ReportButtons.jsx";
import FindingsTable from "../components/FindingsTable.jsx";

export default function Findings() {
  const { scans } = useApp();
  const [params, setParams] = useSearchParams();

  // 주소의 ?scan= 과 ?severity= 로 어떤 목록을 볼지 정합니다. (대시보드·알림에서 이 주소로 넘어옴)
  const scan = scans.find((s) => s.id === params.get("scan")) || scans[0];
  const severity = SEVERITIES.includes(params.get("severity")) ? params.get("severity") : "all";

  const all = useMemo(() => withIds(scan?.findings), [scan]);
  const shown = useMemo(() => (severity === "all" ? all : all.filter((f) => f.severity === severity)), [all, severity]);

  function update(patch) {
    const next = { scan: scan.id, ...(severity !== "all" ? { severity } : {}), ...patch };
    if (next.severity === "all") delete next.severity;
    setParams(next, { replace: true });
  }

  if (!scan) {
    return (
      <>
        <PageHeader title="취약점 목록" description="진단에서 발견된 결함을 위험도별로 확인합니다." />
        <EmptyState title="아직 진단 결과가 없습니다">진단을 실행하면 발견된 취약점이 여기에 표시됩니다.</EmptyState>
      </>
    );
  }

  const count = (sev) => all.filter((f) => f.severity === sev).length;

  return (
    <>
      <PageHeader title="취약점 목록" description="행을 누르면 재현 절차, 탐지 근거, 개선 권고를 볼 수 있습니다.">
        <ReportButtons scan={scan} size="lg" />
      </PageHeader>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5">
          <ScanSelect id="findings-scan" label="진단 선택" scans={scans} value={scan.id} onChange={(id) => update({ scan: id, severity: "all" })} />
          <div role="group" aria-label="위험도 필터" className="flex flex-wrap gap-1.5">
            {["all", ...SEVERITIES].map((sev) => {
              const on = severity === sev;
              return (
                <button key={sev} type="button" aria-pressed={on} onClick={() => update({ severity: sev })}
                  className={`min-h-[40px] rounded-full border px-4 text-sm font-semibold transition ${
                    on ? "border-accent bg-accent text-white" : "border-line bg-surface text-soft hover:bg-thead"
                  }`}>
                  {sev === "all" ? `전체 ${all.length}` : `${sev} ${count(sev)}`}
                </button>
              );
            })}
          </div>
        </div>
        <FindingsTable findings={shown} emptyText={all.length ? "이 위험도에 해당하는 항목이 없습니다." : "탐지된 취약점이 없습니다."} />
      </section>
    </>
  );
}
