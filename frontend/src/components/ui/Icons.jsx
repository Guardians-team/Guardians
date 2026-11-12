// 디자인 시안에 쓰인 채움형 아이콘과 일러스트입니다. (선형 아이콘은 lucide-react 사용)

export function LogoShield({ size = 56 }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 56 62" aria-hidden="true">
      <path d="M28 3 L51 12 V29 C51 44 41 55 28 59 C15 55 5 44 5 29 V12 Z" fill="none" stroke="var(--logo)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M18 31 L25.5 38.5 L39 24" fill="none" stroke="var(--logo)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldFilled({ size = 30 }) {
  return (
    <svg width={size} height={size * 1.07} viewBox="0 0 56 62" aria-hidden="true">
      <path d="M28 3 L51 12 V29 C51 44 41 55 28 59 C15 55 5 44 5 29 V12 Z" fill="currentColor" />
      <path d="M28 14 L42 19.5 V30 C42 39 36 45.5 28 48.5 Z" fill="#fff" opacity="0.35" />
    </svg>
  );
}

export function BugFilled({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="12" cy="13.5" rx="5" ry="6.5" />
      <circle cx="12" cy="6.5" r="3" />
      <path d="M3.5 10.5h4M16.5 10.5h4M3.5 15.5h4M16.5 15.5h4M5 19.5l3-2M19 19.5l-3-2M8.5 3l1.5 2M15.5 3 14 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function WarnFilled({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 22.5 21h-21z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 9v5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1.4" fill="#fff" />
    </svg>
  );
}

export function CheckFilled({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeFilled({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 5C6.5 5 2.7 9.5 1.5 12c1.2 2.5 5 7 10.5 7s9.3-4.5 10.5-7C21.3 9.5 17.5 5 12 5zm0 11.3A4.3 4.3 0 1 1 12 7.7a4.3 4.3 0 0 1 0 8.6z" />
      <circle cx="12" cy="12" r="2.3" />
    </svg>
  );
}

export function LaptopArt(props) {
  return (
    <svg width="210" height="150" viewBox="0 0 210 150" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="laptop-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B8DEF" />
          <stop offset="1" stopColor="#2648A8" />
        </linearGradient>
        <linearGradient id="laptop-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9EEF7" />
          <stop offset="1" stopColor="#B9C4D8" />
        </linearGradient>
      </defs>
      <path d="M70 8 L186 2 Q194 2 194 10 L188 92 Q187 100 179 100 L68 104 Q60 104 61 96 L62 16 Q62 9 70 8 Z" fill="#33415E" />
      <path d="M74 15 L183 9 L178 92 L70 96 Z" fill="url(#laptop-screen)" />
      <path d="M126 32 L146 40 V55 C146 67 138 75 126 79 C114 75 106 67 106 55 V40 Z" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" opacity="0.95" />
      <path d="M117 55 L124 62 L136 49" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 112 L62 102 L190 98 L206 108 Q208 116 200 118 L52 124 Q38 124 40 112 Z" fill="url(#laptop-body)" />
      <path d="M108 109 L146 108 L144 113 L110 114 Z" fill="#9AA7BF" />
      <ellipse cx="124" cy="136" rx="86" ry="7" fill="#1A2B55" opacity="0.08" />
    </svg>
  );
}
