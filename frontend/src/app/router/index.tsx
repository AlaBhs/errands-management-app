import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { RequestsListPage } from "@/features/requests/pages/RequestsListPage";
import { RequestDetailsPage } from "@/features/requests/pages/RequestDetailsPage";
import { CreateRequestPage } from "@/features/requests/pages/CreateRequestPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CourierSchedulePage } from "@/features/courier/pages/CourierSchedulePage";
import { AdminPage } from "@/features/admin/pages/AdminPage";
import { AnalyticsPage } from "@/features/analytics/pages/AnalyticsPage";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/requests" element={<RequestsListPage />} />
          <Route path="/requests/new" element={<CreateRequestPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />
          <Route path="/courier/schedule" element={<CourierSchedulePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}