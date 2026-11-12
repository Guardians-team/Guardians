import mockScans from "../data/mockScans.json";
import mockRules from "../data/mockRules.json";
import mockEvaluation from "../data/mockEvaluation.json";

const OFFLINE = "API 서버에 연결할 수 없습니다. python api.py 가 실행 중인지 확인하세요.";

// JSON 응답만 인정합니다. (API가 꺼져 있으면 개발 서버가 HTML/오류를 돌려줌)
async function getJson(url) {
  const res = await fetch(url);
  const type = res.headers.get("content-type") || "";
  if (!type.includes("application/json")) throw new Error(OFFLINE);
  return { ok: res.ok, status: res.status, data: await res.json() };
}

/**
 * 처음 화면을 띄울 때 호출합니다.
 * API 서버가 꺼져 있으면 예시 데이터(mock)로 대신 채워서,
 * 백엔드 없이도 화면 작업을 할 수 있게 합니다.
 */
export async function loadAll() {
  try {
    const scans = await getJson("/api/scans");
    if (!scans.ok) throw new Error(OFFLINE);
    const [rules, evaluation] = await Promise.all([
      getJson("/api/rules").catch(() => null),
      getJson("/api/evaluation").catch(() => null),
    ]);
    return {
      source: "api",
      scans: scans.data,
      rules: rules?.ok ? rules.data : null,
      evaluation: evaluation?.ok ? evaluation.data : null,
    };
  } catch {
    return { source: "mock", scans: mockScans, rules: mockRules, evaluation: mockEvaluation };
  }
}

export async function runScan(target) {
  let res;
  try {
    res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
    });
  } catch {
    throw new Error(OFFLINE);
  }
  let data = null;
  try {
    data = JSON.parse(await res.text());
  } catch {
    /* JSON이 아닌 응답 */
  }
  if (!res.ok || !data) throw new Error(data?.error || OFFLINE);
  return data;
}

export async function deleteScan(id) {
  const res = await fetch(`/api/scans/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("진단 기록을 삭제하지 못했습니다.");
}

// 백엔드와 같은 규칙: 안전 모드에서는 localhost 만 허용
export function validateTarget(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return "http:// 또는 https:// 로 시작하는 주소를 입력하세요.";
  }
  if (!["http:", "https:"].includes(url.protocol)) return "HTTP 또는 HTTPS 주소만 진단할 수 있습니다.";
  const host = url.hostname;
  const isLocal = host === "localhost" || host === "[::1]" || /^127\.\d+\.\d+\.\d+$/.test(host);
  if (!isLocal) return "안전 모드에서는 localhost(127.0.0.1)만 진단할 수 있습니다.";
  return "";
}
