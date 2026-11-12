import { SEVERITIES } from "./format.js";

export function countBy(list, field) {
  return list.reduce((acc, item) => {
    const k = item[field] || "기타";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

// 진단 1건의 요약 수치
export function summarize(scan) {
  const findings = scan?.findings || [];
  const bySeverity = countBy(findings, "severity");
  const total = findings.length;
  const confirmed = findings.filter((f) => f.status === "Confirmed").length;
  return {
    total,
    bySeverity: SEVERITIES.map((s) => ({ label: s, count: bySeverity[s] || 0 })),
    byType: Object.entries(countBy(findings, "type"))
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    critHigh: (bySeverity.Critical || 0) + (bySeverity.High || 0),
    confirmed,
    confirmedRate: total ? Math.round((confirmed / total) * 100) : 0,
  };
}

// 두 진단 비교: 같은 결함인지는 "제목 + 위치 + 입력값 이름"으로 판단합니다.
const keyOf = (f) => [f.title, f.location, f.parameter || ""].join("|");

export function diffScans(before, after) {
  const beforeKeys = new Set((before?.findings || []).map(keyOf));
  const afterKeys = new Set((after?.findings || []).map(keyOf));
  return {
    added: (after?.findings || []).filter((f) => !beforeKeys.has(keyOf(f))),
    resolved: (before?.findings || []).filter((f) => !afterKeys.has(keyOf(f))),
    unchanged: (after?.findings || []).filter((f) => beforeKeys.has(keyOf(f))),
  };
}

// 정확도 평가: 취약 페이지를 잡았는지(탐지율), 안전 페이지를 잘못 잡았는지(오탐률)
export function evaluate(cases = []) {
  const vulnerable = cases.filter((c) => c.expected === "vulnerable");
  const safe = cases.filter((c) => c.expected === "safe");
  const tp = vulnerable.filter((c) => c.detected).length;
  const fp = safe.filter((c) => c.detected).length;
  return {
    tp,
    fn: vulnerable.length - tp,
    fp,
    tn: safe.length - fp,
    vulnerableTotal: vulnerable.length,
    safeTotal: safe.length,
    detectionRate: vulnerable.length ? Math.round((tp / vulnerable.length) * 100) : 0,
    falsePositiveRate: safe.length ? Math.round((fp / safe.length) * 100) : 0,
  };
}
