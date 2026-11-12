import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Play, RotateCw, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { isEnabled } from "../config/menu.js";
import { formatDate } from "../lib/format.js";
import { summarize } from "../lib/stats.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import { DoneBadge } from "../components/ui/Badges.jsx";
import { EyeFilled } from "../components/ui/Icons.jsx";
import ReportButtons from "../components/ui/ReportButtons.jsx";

export default function Scans() {
  const { scans, scanning, startScan, removeScan, settings } = useApp();
  const navigate = useNavigate();
  const [target, setTarget] = useState(settings.defaultTarget);

  async function submit(e) {
    e.preventDefault();
    await startScan(target);
  }

  function confirmDelete(scan) {
    if (window.confirm(`${formatDate(scan.scan_date)} 진단 기록을 삭제할까요?`)) removeScan(scan.id);
  }

  return (
    <>
      <PageHeader title="진단 관리" description="새 진단을 실행하고 지금까지의 진단 기록을 관리합니다." />

      <section className="card flex flex-col gap-4 p-6">
        <h2 className="card-title"><Play size={20} className="text-accent" aria-hidden="true" />새 진단</h2>
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-0 flex-[999_1_360px] flex-col gap-2">
            <label htmlFor="scan-target" className="text-sm font-medium text-soft">진단 대상 URL</label>
            <input id="scan-target" type="text" className="input" value={target} spellCheck={false}
              onChange={(e) => setTarget(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary min-h-[46px] flex-[1_0_auto] px-6 text-[15px]" disabled={scanning}>
            {scanning ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={14} fill="currentColor" aria-hidden="true" />}
            {scanning ? "진단 중…" : "진단 시작"}
          </button>
        </form>
        <p className="flex items-center gap-2 text-[13px] text-soft">
          <Lock size={14} aria-hidden="true" />
          안전 모드: 직접 실행한 localhost(127.0.0.1) 테스트 서버만 진단할 수 있습니다.
        </p>
      </section>

      <section className="card flex min-w-0 flex-col gap-3.5 px-[22px] pb-3.5 pt-[22px]">
        <h2 className="card-title px-1">
          전체 진단 기록 <span className="text-base font-medium text-soft">{scans.length}건</span>
        </h2>
        {scans.length === 0 ? (
          <p className="py-10 text-center text-sm text-soft">아직 진단 기록이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="bg-thead">
                  <th className="th rounded-l-lg">진단 일시</th>
                  <th className="th">대상 URL</th>
                  <th className="th">발견</th>
                  <th className="th">Critical / High</th>
                  <th className="th text-center">상태</th>
                  <th className="th text-center">관리</th>
                  <th className="th rounded-r-lg text-center">리포트</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => {
                  const s = summarize(scan);
                  const when = formatDate(scan.scan_date);
                  return (
                    <tr key={scan.id} className="border-b border-line last:border-b-0">
                      <td className="td whitespace-nowrap">{when}</td>
                      <td className="td max-w-[260px] truncate">{scan.target}</td>
                      <td className="td">{s.total}건</td>
                      <td className="td">{s.critHigh}건</td>
                      <td className="td text-center"><DoneBadge /></td>
                      <td className="td">
                        <span className="flex justify-center">
                          <button type="button" className="icon-btn" aria-label={`${when} 진단 상세보기`}
                            onClick={() => navigate(isEnabled("/findings") ? `/findings?scan=${scan.id}` : "/")}>
                            <EyeFilled />
                          </button>
                          <button type="button" className="icon-btn" aria-label={`${scan.target} 다시 진단`} disabled={scanning}
                            onClick={() => startScan(scan.target)}>
                            <RotateCw size={18} aria-hidden="true" />
                          </button>
                          <button type="button" className="icon-btn" aria-label={`${when} 진단 기록 삭제`} style={{ color: "var(--pdf-text)" }}
                            onClick={() => confirmDelete(scan)}>
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </span>
                      </td>
                      <td className="td text-center"><ReportButtons scan={scan} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
