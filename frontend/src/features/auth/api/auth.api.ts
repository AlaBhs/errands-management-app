import { apiClient } from '@/shared/api/client';
import type { LoginPayload, RegisterPayload, TokenPair } from '../types';

export const authApi = {
  login: (payload: LoginPayload): Promise<TokenPair> =>
    apiClient.post<TokenPair>('/auth/login', payload).then((r) => r.data),

  refresh: (refreshToken: string): Promise<TokenPair> =>
    apiClient.post<TokenPair>('/auth/refresh', { token: refreshToken }).then((r) => r.data),

  logout: (refreshToken: string): Promise<void> =>
    apiClient.post('/auth/logout', { refreshToken }).then(() => undefined),

  register: (payload: RegisterPayload): Promise<void> =>
    apiClient.post('/auth/register', payload).then(() => undefined),
};