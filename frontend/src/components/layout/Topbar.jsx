import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Loader2, Moon, Search, Settings, Sun } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { isEnabled } from "../../config/menu.js";

export default function Topbar() {
  const { scanning, startScan, settings, updateSettings } = useApp();
  const navigate = useNavigate();
  const [target, setTarget] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 바깥을 누르거나 Esc 를 누르면 프로필 메뉴 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  async function submit(e) {
    e.preventDefault();
    if (!target.trim() || scanning) return;
    const result = await startScan(target);
    if (result) {
      setTarget("");
      navigate(isEnabled("/findings") ? `/findings?scan=${result.id}` : "/");
    }
  }

  const dark = settings.theme === "dark";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <form
        onSubmit={submit}
        className="flex h-[46px] min-w-0 flex-[0_1_600px] items-center gap-3 rounded-full border border-line px-5"
        style={{ background: "var(--search-bg)" }}
      >
        {scanning ? (
          <Loader2 size={19} className="shrink-0 animate-spin text-accent" aria-hidden="true" />
        ) : (
          <Search size={19} className="shrink-0 text-soft" aria-hidden="true" />
        )}
        <label htmlFor="quick-scan" className="sr-only">진단할 URL</label>
        <input
          id="quick-scan"
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={scanning}
          spellCheck={false}
          placeholder={scanning ? "진단 중입니다…" : "진단할 URL을 입력하고 Enter (예: http://127.0.0.1:5000)"}
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-ink outline-none placeholder:text-soft"
        />
      </form>

      <div className="flex items-center gap-3.5">
        <span className="h-7 w-px bg-line" />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex min-h-[44px] items-center gap-2.5 rounded-lg pr-1 text-[15px] font-semibold"
          >
            <span className="flex h-[38px] w-[38px] items-end justify-center overflow-hidden rounded-full" style={{ background: "var(--avatar-bg)" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="var(--avatar-fg)" aria-hidden="true">
                <circle cx="12" cy="9" r="4.2" />
                <path d="M3.5 23c0-5 3.8-8 8.5-8s8.5 3 8.5 8z" />
              </svg>
            </span>
            로컬 모드
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div role="menu" className="card absolute right-0 top-[52px] z-20 flex w-52 flex-col p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => updateSettings({ theme: dark ? "light" : "dark" })}
                className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-left text-sm hover:bg-thead"
              >
                {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
                {dark ? "화이트 테마로 전환" : "다크 네이비로 전환"}
              </button>
              {isEnabled("/settings") && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-left text-sm hover:bg-thead"
                >
                  <Settings size={16} aria-hidden="true" />
                  설정
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
