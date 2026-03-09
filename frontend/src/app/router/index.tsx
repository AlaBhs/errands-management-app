import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { RequestsListPage } from "@/features/requests/pages/RequestsListPage";
import { RequestDetailsPage } from "@/features/requests/pages/RequestDetailsPage";
import { CreateRequestPage } from "@/features/requests/pages/CreateRequestPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/requests" replace />} />
        <Route path="/requests" element={<RequestsListPage />} />
        <Route path="/requests/new" element={<CreateRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailsPage />} />
      </Route>
    </Routes>
  );
}