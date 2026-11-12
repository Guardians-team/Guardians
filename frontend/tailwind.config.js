/** 색은 전부 src/index.css 의 CSS 변수에서 옵니다. 테마를 바꾸면 변수 값만 바뀝니다. */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        thead: "var(--thead)",
        line: "var(--line)",
        "card-line": "var(--card-line)",
        ink: "var(--ink)",
        soft: "var(--soft)",
        accent: "var(--accent)",
        tile: "var(--tile)",
        ok: "var(--ok-text)",
      },
      fontFamily: {
        sans: ['"Noto Sans KR"', '"Apple SD Gothic Neo"', '"Malgun Gothic"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
