import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { deleteScan, loadAll, runScan, validateTarget } from "../lib/api.js";
import PrintReport from "../components/PrintReport.jsx";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const DEFAULT_SETTINGS = {
  theme: "light",                         // "light" | "dark"
  defaultTarget: "http://127.0.0.1:5000",
  author: "Guardians",
};

function readSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("guardians-settings") || "{}") };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(readSettings);
  const [scans, setScans] = useState([]);        // 최신순
  const [rules, setRules] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [source, setSource] = useState("api");   // "api" | "mock"
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState(null);    // { kind: "error" | "ok", text }
  const [printTarget, setPrintTarget] = useState(null);

  // 설정 저장 + 테마 적용 (<html data-theme>)
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    try {
      localStorage.setItem("guardians-settings", JSON.stringify(settings));
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [settings]);

  useEffect(() => {
    loadAll().then((result) => {
      setScans(result.scans);
      setRules(result.rules);
      setEvaluation(result.evaluation);
      setSource(result.source);
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  // 진단 실행. 성공하면 새 진단을 돌려주고, 실패하면 null 을 돌려주며 안내 문구를 띄웁니다.
  const startScan = useCallback(async (rawTarget) => {
    const target = rawTarget.trim();
    const problem = validateTarget(target);
    if (problem) {
      setNotice({ kind: "error", text: problem });
      return null;
    }
    setScanning(true);
    setNotice(null);
    try {
      const result = await runScan(target);
      // 예시 데이터를 보던 중이었다면 예시는 지우고 실제 결과만 남깁니다.
      setScans((list) => (source === "api" ? [result, ...list] : [result]));
      setSource("api");
      setNotice({ kind: "ok", text: `진단 완료: 취약점 ${result.findings.length}건 발견` });
      return result;
    } catch (e) {
      setNotice({ kind: "error", text: e.message });
      return null;
    } finally {
      setScanning(false);
    }
  }, [source]);

  const removeScan = useCallback(async (id) => {
    try {
      if (source === "api") await deleteScan(id);
      setScans((list) => list.filter((s) => s.id !== id));
    } catch (e) {
      setNotice({ kind: "error", text: e.message });
    }
  }, [source]);

  // PDF: 인쇄용 리포트를 그린 뒤 브라우저 인쇄 창을 엽니다.
  const printScan = useCallback((scan) => setPrintTarget(scan), []);
  useEffect(() => {
    if (!printTarget) return;
    const done = () => setPrintTarget(null);
    window.addEventListener("afterprint", done);
    const timer = setTimeout(() => window.print(), 80);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", done);
    };
  }, [printTarget]);

  const value = useMemo(
    () => ({
      settings, updateSettings,
      scans, latest: scans[0] || null, previous: scans[1] || null,
      rules, evaluation, source, loading,
      scanning, startScan, removeScan,
      notice, clearNotice: () => setNotice(null),
      printScan,
    }),
    [settings, updateSettings, scans, rules, evaluation, source, loading, scanning, startScan, removeScan, notice, printScan]
  );

  return (
    <AppContext.Provider value={value}>
      <div className="screen-only">{children}</div>
      {printTarget && <PrintReport scan={printTarget} author={settings.author} />}
    </AppContext.Provider>
  );
}
