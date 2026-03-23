import { Routes, Route, Navigate } from 'react-router';
import { MainLayout }    from '@/app/layouts/MainLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RoleGuard }     from '@/features/auth/components/RoleGuard';
import { LoginPage }     from '@/features/auth/pages/LoginPage';
import { UserRole }      from '@/features/auth';
import { PageSpinner }   from '@/shared/components/PageSpinner';
import { lazy, Suspense } from 'react';

// Heavy pages — loaded only when visited
const RequestsListPage   = lazy(() => import('@/features/requests/pages/RequestsListPage').then(m => ({ default: m.RequestsListPage })));
const RequestDetailsPage = lazy(() => import('@/features/requests/pages/RequestDetailsPage').then(m => ({ default: m.RequestDetailsPage })));
const CreateRequestPage  = lazy(() => import('@/features/requests/pages/CreateRequestPage').then(m => ({ default: m.CreateRequestPage })));
const MyRequestsPage     = lazy(() => import('@/features/requests/pages/MyRequestsPage').then(m => ({ default: m.MyRequestsPage })));
const MyAssignmentsPage  = lazy(() => import('@/features/requests/pages/MyAssignmentsPage').then(m => ({ default: m.MyAssignmentsPage })));
const AdminPage          = lazy(() => import('@/features/admin/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AnalyticsPage      = lazy(() => import('@/features/analytics/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const UserManagementPage = lazy(() => import('@/features/users/pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const PublicOrDashboard  = lazy(() => import('@/app/router/PublicOrDashboard').then(m => ({ default: m.PublicOrDashboard })));

export function AppRouter() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route index element={<PublicOrDashboard />} />
            <Route path="/requests/:id" element={<RequestDetailsPage />} />

            <Route element={<RoleGuard allowed={[UserRole.Admin]} />}>
              <Route path="/requests"    element={<RequestsListPage />} />
              <Route path="/analytics"   element={<AnalyticsPage />} />
              <Route path="/admin"       element={<AdminPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
            </Route>

            <Route element={<RoleGuard allowed={[UserRole.Collaborator]} />}>
              <Route path="/requests/mine" element={<MyRequestsPage />} />
              <Route path="/requests/new"  element={<CreateRequestPage />} />
            </Route>

            <Route element={<RoleGuard allowed={[UserRole.Courier]} />}>
              <Route path="/assignments" element={<MyAssignmentsPage />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

