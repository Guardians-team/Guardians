import { useApp } from "../../context/AppContext.jsx";
import { downloadExcel } from "../../lib/export.js";
import { formatDate } from "../../lib/format.js";

// 진단 1건의 리포트를 Excel / PDF 로 내려받는 버튼 한 쌍
export default function ReportButtons({ scan, size = "sm" }) {
  const { source, printScan } = useApp();
  const when = formatDate(scan.scan_date);
  const base =
    size === "lg"
      ? "min-h-[44px] px-4 text-sm"
      : "h-8 min-w-[46px] px-2 text-xs";
  return (
    <span className="inline-flex gap-1.5">
      <button
        type="button"
        aria-label={`${when} 리포트 Excel로 내려받기`}
        onClick={() => downloadExcel(scan, source)}
        className={`${base} rounded-md border font-bold transition hover:brightness-95`}
        style={{ background: "var(--xls-bg)", borderColor: "var(--xls-line)", color: "var(--xls-text)" }}
      >
        XLSX
      </button>
      <button
        type="button"
        aria-label={`${when} 리포트 PDF로 내려받기`}
        onClick={() => printScan(scan)}
        className={`${base} rounded-md border font-bold transition hover:brightness-95`}
        style={{ background: "var(--pdf-bg)", borderColor: "var(--pdf-line)", color: "var(--pdf-text)" }}
      >
        PDF
      </button>
    </span>
  );
}
