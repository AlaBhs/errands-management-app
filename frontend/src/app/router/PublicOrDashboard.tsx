import { lazy, Suspense }         from 'react';
import { useAuthStore }           from '@/features/auth/store/authStore';
import { PageSpinner }            from '@/shared/components/PageSpinner';

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage')
    .then(m => ({ default: m.DashboardPage })));

const LandingPage = lazy(() =>
  import('@/app/pages/LandingPage')
    .then(m => ({ default: m.LandingPage })));

export function PublicOrDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <Suspense fallback={<PageSpinner />}>
      {isAuthenticated ? <DashboardPage /> : <LandingPage />}
    </Suspense>
  );
}