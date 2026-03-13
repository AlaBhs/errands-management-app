import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { UserRole } from '@/features/auth/types/auth.enums';

interface RoleGuardProps {
  allowed: UserRole[];
}

/**
 * RoleGuard is a component that restricts access to its child routes based on the user's role. 
 * If the user's role is not in the allowed list, 
 * they will be redirected to the "/requests" page.
 */
export default function RoleGuard({ allowed }: RoleGuardProps) {
  const role = useAuthStore((s) => s.user?.role);

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/requests" replace />;
  }

  return <Outlet />;
}