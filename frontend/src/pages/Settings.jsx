import { Lock, Moon, Sun } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { SeverityBadge } from "../components/ui/Badges.jsx";

function Section({ title, description, children }) {
  return (
    <section className="card grid gap-5 p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="flex flex-col gap-1">
        <h2 className="text-[17px] font-bold">{title}</h2>
        <p className="text-sm leading-relaxed text-soft">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}

const THEMES = [
  { key: "light", label: "화이트", Icon: Sun, side: "#172552", page: "#F5F7FC", card: "#FFFFFF" },
  { key: "dark", label: "다크 네이비", Icon: Moon, side: "#0A1226", page: "#0B1120", card: "#111A2E" },
];

export default function Settings() {
  const { settings, updateSettings, rules } = useApp();

  return (
    <>
      <PageHeader title="설정" description="화면 테마와 진단, 리포트 기본값을 정합니다. 변경 사항은 바로 저장됩니다." />

      <Section title="화면 테마" description="대시보드 전체의 색 구성을 고릅니다.">
        <div role="radiogroup" aria-label="화면 테마" className="grid gap-3 sm:grid-cols-2">
          {THEMES.map(({ key, label, Icon, side, page, card }) => {
            const on = settings.theme === key;
            return (
              <button key={key} type="button" role="radio" aria-checked={on} onClick={() => updateSettings({ theme: key })}
                className={`flex flex-col gap-3 rounded-xl border-2 p-3 text-left transition ${on ? "border-accent" : "border-line hover:border-soft"}`}>
                <span aria-hidden="true" className="flex h-24 overflow-hidden rounded-lg border border-line">
                  <span className="w-1/4" style={{ background: side }} />
                  <span className="flex flex-1 flex-col gap-1.5 p-2.5" style={{ background: page }}>
                    <span className="h-3 w-1/2 rounded" style={{ background: card }} />
                    <span className="flex flex-1 gap-1.5">
                      <span className="flex-1 rounded" style={{ background: card }} />
                      <span className="flex-1 rounded" style={{ background: card }} />
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-2 text-[15px] font-semibold">
                  <Icon size={16} aria-hidden="true" />
                  {label}
                  {on && <span className="ml-auto text-[13px] font-bold text-accent">사용 중</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="진단 설정" description="새 진단 화면에 기본으로 채워질 값입니다.">
        <div className="flex flex-col gap-2">
          <label htmlFor="default-target" className="text-sm font-medium text-soft">기본 진단 대상 URL</label>
          <input id="default-target" type="text" className="input" spellCheck={false} value={settings.defaultTarget}
            onChange={(e) => updateSettings({ defaultTarget: e.target.value })} />
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-thead px-4 py-3.5">
          <Lock size={18} className="mt-0.5 shrink-0 text-soft" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-semibold">안전 모드 (변경 불가)</p>
            <p className="text-sm leading-relaxed text-soft">
              허가 없이 다른 사람의 서버를 진단하지 않도록, localhost(127.0.0.1) 대상만 진단하도록 고정되어 있습니다.
            </p>
          </div>
        </div>
      </Section>

      <Section title="리포트 설정" description="PDF 리포트 상단에 표시되는 정보입니다.">
        <div className="flex flex-col gap-2">
          <label htmlFor="report-author" className="text-sm font-medium text-soft">작성자 (팀 이름)</label>
          <input id="report-author" type="text" className="input max-w-[360px]" value={settings.author}
            onChange={(e) => updateSettings({ author: e.target.value })} />
        </div>
      </Section>

      <Section title="탐지 규칙" description="스캐너가 사용하는 규칙입니다. payloads.json 파일에서 수정할 수 있습니다.">
        {!rules ? (
          <p className="text-sm text-soft">탐지 규칙을 불러오지 못했습니다.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">SQL 오류 패턴</h3>
              <ul className="flex flex-col gap-1.5">
                {(rules.sql_error_signatures || []).map((r) => (
                  <li key={r.label} className="flex flex-wrap items-baseline justify-between gap-x-4 rounded-lg bg-thead px-3.5 py-2.5 text-sm">
                    <span className="font-semibold">{r.label}</span>
                    <code className="break-all text-[13px] text-soft">{r.pattern}</code>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">점검하는 보안 헤더</h3>
              <ul className="flex flex-col gap-1.5">
                {Object.entries(rules.security_headers || {}).map(([name, description]) => (
                  <li key={name} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-thead px-3.5 py-2.5 text-sm">
                    <span className="font-semibold">{name}</span>
                    <span className="text-[13px] text-soft">{description}</span>
                  </li>
                ))}
              </ul>
            </div>
            {rules.reflection_marker && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold">XSS 반사 확인용 마커</h3>
                <code className="break-all rounded-lg bg-thead px-3.5 py-2.5 text-[13px] text-soft">{rules.reflection_marker}</code>
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
