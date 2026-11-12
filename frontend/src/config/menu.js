import { BarChart3, Bug, FileText, Home, Play, Settings } from "lucide-react";
import Dashboard from "../pages/Dashboard.jsx";
import Scans from "../pages/Scans.jsx";
import Findings from "../pages/Findings.jsx";
import Analysis from "../pages/Analysis.jsx";
import Reports from "../pages/Reports.jsx";
import SettingsPage from "../pages/Settings.jsx";

/**
 * 사이드바 메뉴 = 페이지 목록.
 * 완성하지 못한 페이지는 enabled 를 false 로 바꾸면
 * 사이드바에서 사라지고 주소로 들어와도 대시보드로 돌아갑니다.
 */
export const MENU = [
  { path: "/",         label: "대시보드",    icon: Home,      page: Dashboard,    enabled: true },
  { path: "/scans",    label: "진단 관리",   icon: Play,      page: Scans,        enabled: true },
  { path: "/findings", label: "취약점 목록", icon: Bug,       page: Findings,     enabled: true },
  { path: "/analysis", label: "진단 분석",   icon: BarChart3, page: Analysis,     enabled: true },
  { path: "/reports",  label: "리포트 관리", icon: FileText,  page: Reports,      enabled: true },
  { path: "/settings", label: "설정",        icon: Settings,  page: SettingsPage, enabled: true },
];

export const ENABLED_MENU = MENU.filter((m) => m.enabled);

export function isEnabled(path) {
  return ENABLED_MENU.some((m) => m.path === path);
}
