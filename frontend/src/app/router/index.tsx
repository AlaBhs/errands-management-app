import { Routes, Route } from "react-router";
import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { UserRole } from "@/features/auth";
import { PageSpinner } from "@/shared/components/PageSpinner";
import { lazy, Suspense } from "react";

// Heavy pages — loaded only when visited
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const RequestsListPage = lazy(() =>
  import("@/features/requests/pages/RequestsListPage").then((m) => ({
    default: m.RequestsListPage,
  })),
);
const RequestDetailsPage = lazy(() =>
  import("@/features/requests/pages/RequestDetailsPage").then((m) => ({
    default: m.RequestDetailsPage,
  })),
);
const CreateRequestPage = lazy(() =>
  import("@/features/requests/pages/CreateRequestPage").then((m) => ({
    default: m.CreateRequestPage,
  })),
);
const MyRequestsPage = lazy(() =>
  import("@/features/requests/pages/MyRequestsPage").then((m) => ({
    default: m.MyRequestsPage,
  })),
);
const MySchedulePage = lazy(() =>
  import("@/features/requests/pages/MySchedulePage").then((m) => ({
    default: m.MySchedulePage,
  })),
);
const AdminPage = lazy(() =>
  import("@/features/admin/pages/AdminPage").then((m) => ({
    default: m.AdminPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import("@/features/analytics/pages/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);
const UserManagementPage = lazy(() =>
  import("@/features/users/pages/UserManagementPage").then((m) => ({
    default: m.UserManagementPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("@/features/notifications/pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
);
const DeliveryBatchesPage = lazy(() =>
  import("@/features/delivery/pages/DeliveryBatchesPage").then((m) => ({
    default: m.DeliveryBatchesPage,
  })),
);
const DeliveryBatchDetailsPage = lazy(() =>
  import("@/features/delivery/pages/DeliveryBatchDetailsPage").then((m) => ({
    default: m.DeliveryBatchDetailsPage,
  })),
);
const CreateDeliveryBatchPage = lazy(() =>
  import("@/features/delivery/pages/CreateDeliveryBatchPage").then((m) => ({
    default: m.CreateDeliveryBatchPage,
  })),
);
const PublicOrDashboard = lazy(() =>
  import("@/app/router/PublicOrDashboard").then((m) => ({
    default: m.PublicOrDashboard,
  })),
);
const MyTemplatesPage = lazy(() =>
  import("@/features/request-templates/pages/MyTemplatesPage").then((m) => ({
    default: m.MyTemplatesPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);

export function AppRouter() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route index element={<PublicOrDashboard />} />
        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests/:id" element={<RequestDetailsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* ── Admin only ─────────────────────────────── */}
            <Route element={<RoleGuard allowed={[UserRole.Admin]} />}>
              <Route path="/requests" element={<RequestsListPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route
                path="/delivery/new"
                element={<CreateDeliveryBatchPage />}
              />
            </Route>

            {/* ── Delivery — Admin + Reception ──────────────────────── */}
            <Route
              element={
                <RoleGuard allowed={[UserRole.Admin, UserRole.Reception]} />
              }
            >
              <Route path="/delivery" element={<DeliveryBatchesPage />} />
              <Route
                path="/delivery/:id"
                element={<DeliveryBatchDetailsPage />}
              />
            </Route>

            {/* ── Collaborator only ─────────────────────────────── */}
            <Route element={<RoleGuard allowed={[UserRole.Collaborator]} />}>
              <Route path="/requests/mine" element={<MyRequestsPage />} />
              <Route path="/requests/new" element={<CreateRequestPage />} />
              <Route path="/templates" element={<MyTemplatesPage />} />
            </Route>
            {/* ── Courier only ─────────────────────────────── */}
            <Route element={<RoleGuard allowed={[UserRole.Courier]} />}>
              <Route path="/assignments" element={<MySchedulePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
