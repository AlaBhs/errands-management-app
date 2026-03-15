import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import type { LoginPayload, RegisterPayload } from '../types';
import { useAuthStore } from '../store/authStore';
import { extractUserFromToken } from '../utils/jwtUtils';
import { UserRole } from '../types/auth.enums';

function getHomeRoute(role?: UserRole): string {
  switch (role) {
    case UserRole.Admin:        return '/requests';
    case UserRole.Collaborator: return '/requests/mine';
    case UserRole.Courier:      return '/assignments';
    default:                    return '/';
  }
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ accessToken }) => {
      const user = extractUserFromToken(accessToken);
      setAuth(user, accessToken);
      navigate(getHomeRoute(user.role), { replace: true });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
      navigate('/login', { replace: true });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
}