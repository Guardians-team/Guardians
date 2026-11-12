import { Link, useNavigate } from "react-router-dom";
import { BarChart3, History, Play, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { isEnabled } from "../config/menu.js";
import { formatDate, signed } from "../lib/format.js";
import { summarize } from "../lib/stats.js";
import PageHeader, { EmptyState } from "../components/ui/PageHeader.jsx";
import { BugFilled, CheckFilled, EyeFilled, LaptopArt, ShieldFilled, WarnFilled } from "../components/ui/Icons.jsx";
import { DoneBadge } from "../components/ui/Badges.jsx";
import ReportButtons from "../components/ui/ReportButtons.jsx";
import Sparkline from "../components/charts/Sparkline.jsx";
import Donut from "../components/charts/Donut.jsx";
import SeverityBars from "../components/charts/SeverityBars.jsx";

function Kpi({ id, label, value, delta, icon, iconColor = "var(--icon-blue)", series }) {
  return (
    <div className="card relative flex min-h-[118px] items-center gap-[18px] overflow-hidden px-[22px] py-5">
      <Sparkline id={id} values={series} />
      <div className="relative flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-tile" style={{ color: iconColor }}>
        {icon}
      </div>
      <div className="relative flex min-w-0 flex-col">
        <span className="text-[15px] font-medium text-soft">{label}</span>
        <span className="text-[32px] font-extrabold leading-tight tracking-tight">{value}</span>
        <span className="text-[12.5px] font-semibold text-accent">{delta}</span>
      </div>
    </div>
  );
}

function More({ to, children = "더보기", strong = false }) {
  if (!isEnabled(to.split("?")[0])) return null;
  return (
    <Link to={to} className={`text-sm no-underline hover:underline ${strong ? "font-semibold text-accent" : "text-soft"}`}>
      {children} ›
    </Link>
  );
}

export default function Dashboard() {
  const { scans, latest, previous } = useApp();
  const navigate = useNavigate();

  if (!latest) {
    return (
      <>
        <PageHeader title="보안 진단 대시보드" description="웹 애플리케이션의 보안 상태를 한눈에 확인하세요." />
        <EmptyState title="아직 진단 결과가 없습니다">
          위 검색창에 진단할 URL을 입력하고 Enter 를 누르면 첫 진단이 시작됩니다.
        </EmptyState>
      </>
    );
  }

  const now = summarize(latest);
  const before = previous ? summarize(previous) : null;
  const history = [...scans].reverse().map(summarize); // 오래된 것 → 최신

  // 직전 진단과 비교한 증감 (예: "▲ +2")
  const vs = (current, past, unit = "") => (before ? signed(current - past, unit) : "첫 진단");

  return (
    <>
      <PageHeader title="보안 진단 대시보드" description="웹 애플리케이션의 보안 상태를 한눈에 확인하세요." />

      <section aria-label="요약" className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        <Kpi id="spark-scans" label="전체 진단 수" value={scans.length} delta={`최근 ${formatDate(latest.scan_date).slice(5, 10)}`}
          icon={<ShieldFilled />} series={history.map((_, i) => i + 1)} />
        <Kpi id="spark-total" label="발견된 취약점" value={now.total} delta={vs(now.total, before?.total)}
          icon={<BugFilled />} series={history.map((h) => h.total)} />
        <Kpi id="spark-crit" label="Critical / High" value={now.critHigh} delta={vs(now.critHigh, before?.critHigh)}
          icon={<WarnFilled />} iconColor="var(--icon-warn)" series={history.map((h) => h.critHigh)} />
        <Kpi id="spark-rate" label="검증 완료율" value={`${now.confirmedRate}%`} delta={vs(now.confirmedRate, before?.confirmedRate, "%p")}
          icon={<CheckFilled />} series={history.map((h) => h.confirmedRate)} />
      </section>

      <section className="grid gap-[18px] xl:grid-cols-2">
        <div className="card flex flex-col gap-3.5 px-[26px] py-6">
          <div className="flex items-center justify-between">
            <h2 className="card-title"><BarChart3 size={22} className="text-accent" aria-hidden="true" />취약점 유형별 현황</h2>
            <More to="/findings" />
          </div>
          <Donut segments={now.byType} />
        </div>

        <div className="card flex flex-col gap-3.5 px-[26px] py-6">
          <div className="flex items-center justify-between">
            <h2 className="card-title"><TrendingUp size={22} className="text-accent" aria-hidden="true" />위험도별 분포</h2>
            <More to="/analysis" />
          </div>
          <SeverityBars data={now.bySeverity} />
        </div>
      </section>

      <section className="grid gap-[18px] xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="card flex min-w-0 flex-col gap-3.5 px-[22px] pb-3.5 pt-[22px]">
          <div className="flex items-center justify-between px-1">
            <h2 className="card-title"><History size={22} className="text-accent" aria-hidden="true" />최근 진단 내역</h2>
            <More to="/scans" strong>전체 보기</More>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse [&_td]:px-2.5 [&_th]:px-2.5">
              <thead>
                <tr className="bg-thead">
                  <th className="th rounded-l-lg">진단 일시</th>
                  <th className="th">대상 URL</th>
                  <th className="th">발견된 취약점</th>
                  <th className="th text-center">상태</th>
                  <th className="th text-center">상세보기</th>
                  <th className="th rounded-r-lg text-center">리포트</th>
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 3).map((scan) => (
                  <tr key={scan.id} className="border-b border-line last:border-b-0">
                    <td className="td whitespace-nowrap">{formatDate(scan.scan_date)}</td>
                    <td className="td w-full max-w-0 truncate">{scan.target}</td>
                    <td className="td">{scan.findings.length}건</td>
                    <td className="td text-center"><DoneBadge /></td>
                    <td className="td text-center">
                      <button type="button" className="icon-btn" aria-label={`${formatDate(scan.scan_date)} 진단 상세보기`}
                        onClick={() => navigate(isEnabled("/findings") ? `/findings?scan=${scan.id}` : "/")}>
                        <EyeFilled />
                      </button>
                    </td>
                    <td className="td text-center"><ReportButtons scan={scan} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card relative flex min-h-[248px] flex-col justify-center gap-2.5 overflow-hidden px-[30px] py-[34px]" style={{ background: "var(--cta-bg)" }}>
          <svg width="360" height="260" viewBox="0 0 360 260" aria-hidden="true" className="absolute -right-[60px] -top-5 opacity-90">
            <path d="M60 30 C 140 -10, 260 40, 360 0 L 360 260 L 120 260 C 180 200, 40 140, 60 30 Z" fill="var(--cta-blob)" />
          </svg>
          <LaptopArt className="absolute bottom-6 right-3 hidden h-auto w-[150px] sm:block" />
          <h2 className="relative text-[22px] font-extrabold tracking-tight">새로운 진단을 시작하세요</h2>
          <p className="relative mb-3.5 max-w-[170px] text-[14.5px] leading-[1.7] text-soft [word-break:keep-all]">
            간단한 설정으로 지금 바로 보안 진단을 시작할 수 있습니다.
          </p>
          <button type="button" className="btn-primary relative min-h-[48px] self-start px-[22px] text-[15px]"
            onClick={() => (isEnabled("/scans") ? navigate("/scans") : document.getElementById("quick-scan")?.focus())}>
            <Play size={14} fill="currentColor" aria-hidden="true" />
            진단 시작하기 ›
          </button>
        </div>
      </section>
    </>
  );
}
