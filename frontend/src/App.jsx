import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import { ENABLED_MENU } from "./config/menu.js";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {ENABLED_MENU.map(({ path, page: Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
        {/* 꺼 둔 메뉴나 없는 주소는 대시보드로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
