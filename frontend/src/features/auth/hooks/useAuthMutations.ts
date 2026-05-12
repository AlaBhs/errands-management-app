import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import type { LoginPayload, RegisterPayload } from '../types';
import { useAuthStore } from '../store/authStore';
import { extractUserFromToken } from '../utils/jwtUtils';
import { toast } from 'sonner';



export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ accessToken }) => {
      const user = extractUserFromToken(accessToken);
      setAuth(user, accessToken);
      navigate('/dashboard', { replace: true });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      toast.success('Signed out successfully.');
    },
    onSettled: () => {
      clearAuth();
      navigate('/login', { replace: true, state: null });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
}