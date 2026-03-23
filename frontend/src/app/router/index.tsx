import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/app/layouts/MainLayout";
import { RequestsListPage } from "@/features/requests/pages/RequestsListPage";
import { RequestDetailsPage } from "@/features/requests/pages/RequestDetailsPage";
import { CreateRequestPage } from "@/features/requests/pages/CreateRequestPage";
import { MyRequestsPage } from "@/features/requests/pages/MyRequestsPage";
import { MyAssignmentsPage } from "@/features/requests/pages/MyAssignmentsPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { AdminPage } from "@/features/admin/pages/AdminPage";
import { AnalyticsPage } from "@/features/analytics/pages/AnalyticsPage";
import { UserManagementPage } from "@/features/users/pages/UserManagementPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { UserRole } from "@/features/auth";

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Shared */}
          <Route index element={<DashboardPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />

          {/* Admin only */}
          <Route element={<RoleGuard allowed={[UserRole.Admin]} />}>
            <Route path="/requests" element={<RequestsListPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>

          {/* Collaborator only */}
          <Route element={<RoleGuard allowed={[UserRole.Collaborator]} />}>
            <Route path="/requests/mine" element={<MyRequestsPage />} />
            <Route path="/requests/new" element={<CreateRequestPage />} />
          </Route>

          {/* Courier only */}
          <Route element={<RoleGuard allowed={[UserRole.Courier]} />}>
            <Route path="/assignments" element={<MyAssignmentsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
