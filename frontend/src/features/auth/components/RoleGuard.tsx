import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageSpinner } from '@/shared/components/PageSpinner';
import type { UserRole } from '@/features/auth/types/auth.enums';

interface RoleGuardProps {
  allowed: UserRole[];
}

export function RoleGuard({ allowed }: RoleGuardProps) {
  const role = useAuthStore((s) => s.user?.role);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  if (isInitializing) {
    return <PageSpinner />;
  }

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}