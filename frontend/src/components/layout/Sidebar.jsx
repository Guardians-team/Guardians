import { NavLink } from "react-router-dom";
import { ENABLED_MENU } from "../../config/menu.js";
import { LogoShield, ShieldFilled } from "../ui/Icons.jsx";

export default function Sidebar() {
  return (
    <aside
      className="relative flex shrink-0 flex-col gap-5 overflow-hidden px-3.5 py-5 lg:min-h-screen lg:w-[220px] lg:gap-8 lg:pb-6 lg:pt-9"
      style={{ background: "var(--side-bg)", color: "var(--side-text)" }}
    >
      {/* 배경 물결 장식 */}
      <svg width="320" height="420" viewBox="0 0 320 420" aria-hidden="true" className="pointer-events-none absolute -left-10 bottom-28 hidden opacity-50 lg:block">
        <path d="M0 120 C 90 60, 180 180, 320 100" fill="none" stroke="var(--side-wave)" strokeWidth="1.5" />
        <path d="M0 170 C 100 110, 190 230, 320 150" fill="none" stroke="var(--side-wave)" strokeWidth="1.5" />
        <path d="M0 220 C 110 160, 200 280, 320 200" fill="none" stroke="var(--side-wave)" strokeWidth="1.5" />
        <path d="M0 300 C 120 230, 210 340, 320 270 L 320 420 L 0 420 Z" fill="var(--side-wave-fill)" />
      </svg>

      <div className="relative flex items-center gap-3 lg:flex-col lg:gap-3.5 lg:text-center">
        <span className="lg:hidden"><LogoShield size={30} /></span>
        <span className="hidden lg:block"><LogoShield size={56} /></span>
        <span className="flex flex-col leading-tight lg:items-center">
  <span className="text-xs font-semibold tracking-[0.2em]" style={{ color: "var(--side-mute)" }}>
    GUARDIANS
  </span>
  <span className="text-[22px] font-extrabold text-white">Verdict</span>
</span>
      </div>

      <nav aria-label="주 메뉴" className="relative flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ENABLED_MENU.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className="flex min-h-[46px] shrink-0 items-center gap-3.5 whitespace-nowrap rounded-[10px] px-4 text-[15px] transition lg:min-h-[50px]"
            style={({ isActive }) =>
              isActive
                ? { background: "var(--side-active)", color: "#fff", fontWeight: 700, boxShadow: "0 6px 14px rgba(20,50,140,0.35)" }
                : { color: "var(--side-text)", fontWeight: 500 }
            }
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="relative mt-auto hidden flex-col items-center gap-4 lg:flex">
        <div className="flex w-full flex-col items-center gap-2 rounded-xl px-3.5 py-[18px] text-center" style={{ background: "var(--side-card)" }}>
          <span style={{ color: "var(--logo)" }}><ShieldFilled size={26} /></span>
          <span className="text-[12.5px] leading-relaxed">
            안전한 웹을 위한
            <br />
            자동 보안 진단 솔루션
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--side-mute)" }}>v1.0.0</span>
      </div>
    </aside>
  );
}
