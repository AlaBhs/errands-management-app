import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import { extractUserFromToken } from '../utils/jwtUtils';
import { PageSpinner } from '@/shared/components/PageSpinner';
import { signalr } from '@/shared/api/signalr';
import { useMessagingStore } from '@/features/messaging/store/messagingStore';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, setInitializing, isInitializing } = useAuthStore();

  useEffect(() => {
    // No token argument — browser sends HttpOnly cookie automatically
    // If no cookie exists, backend returns 401 and we fall through to clearAuth
    authApi
      .refresh()
      .then(({ accessToken }) => {
        const user = extractUserFromToken(accessToken);
        setAuth(user, accessToken);
        signalr.connect(() => useAuthStore.getState().accessToken ?? '');
        const { startConnection: startMessagingConnection } = useMessagingStore.getState();
        startMessagingConnection(() => useAuthStore.getState().accessToken ?? '', queryClient);
      })
      .catch(() => {
        const { stopConnection } = useMessagingStore.getState();
        stopConnection();
        clearAuth();
      })
      .finally(() => {
        setInitializing(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing) return <PageSpinner />;

  return <>{children}</>;
}