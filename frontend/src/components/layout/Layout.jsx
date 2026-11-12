import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { useApp } from "../../context/AppContext.jsx";

export default function Layout() {
  const { notice, clearNotice, source, loading } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink lg:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-[22px] px-4 pb-10 pt-6 sm:px-9">
        <Topbar />

        {notice && (
          <div
            role={notice.kind === "error" ? "alert" : "status"}
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium"
            style={
              notice.kind === "error"
                ? { background: "var(--pdf-bg)", borderColor: "var(--pdf-line)", color: "var(--pdf-text)" }
                : { background: "var(--xls-bg)", borderColor: "var(--xls-line)", color: "var(--xls-text)" }
            }
          >
            {notice.text}
            <button type="button" aria-label="안내 닫기" onClick={clearNotice} className="flex h-8 w-8 items-center justify-center rounded-md">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {loading ? <p className="text-sm text-soft">결과를 불러오는 중…</p> : <Outlet />}

        {!loading && source === "mock" && (
          <p className="text-xs text-soft">
            API 서버에 연결되지 않아 예시 데이터를 표시하고 있습니다. python api.py 를 실행하면 실제 결과가 표시됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
