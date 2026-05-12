import { apiClient } from '@/shared/api/client';
import type { LoginPayload, RegisterPayload } from '../types';

export interface AccessTokenResponse {
  accessToken: string;
  expiresAt: string;
  email: string;
  fullName: string;
  roles: string[];
}

export const authApi = {
  login: (payload: LoginPayload): Promise<AccessTokenResponse> =>
    apiClient.post<AccessTokenResponse>('/auth/login', payload).then((r) => r.data),

  refresh: (): Promise<AccessTokenResponse> =>
    apiClient.post<AccessTokenResponse>('/auth/refresh').then((r) => r.data),

  logout: (): Promise<void> =>
    apiClient.post('/auth/logout').then(() => undefined),

  register: (payload: RegisterPayload): Promise<void> =>
    apiClient.post('/auth/register', payload).then(() => undefined),
};