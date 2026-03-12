import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import type { LoginPayload, RegisterPayload } from '../types';
import { useAuthStore } from '../store/authStore';
import { extractUserFromToken } from '../utils/jwtUtils';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ accessToken, refreshToken }) => {
      const user = extractUserFromToken(accessToken);
      setAuth(user, accessToken, refreshToken);
      navigate('/requests', { replace: true });
    },
  });
}

export function useLogout() {
  const { refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken ?? ''),
    onSettled: () => {
      // Always clear local state, even if the server call fails
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