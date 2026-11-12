import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api 로 시작하는 요청은 Flask API(8000번)로 넘깁니다. CORS 설정이 필요 없습니다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
});
