import { Routes, Route } from "react-router-dom";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Errands Management — First Landing</div>} />
    </Routes>
  );
}