import { apiClient } from '@/shared/api/client';
import type { ApiResponse, PaginatedResponse } from '@/shared/api/types';
import type { UserListItemDto, UserQueryParameters } from '../types';

export const usersApi = {
  getAll: (params?: UserQueryParameters) =>
    apiClient
      .get<PaginatedResponse<UserListItemDto>>('/users', { params })
      .then((res) => res.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<UserListItemDto>>(`/users/${id}`)
      .then((res) => res.data),

  deactivate: (id: string) =>
    apiClient
      .patch<void>(`/users/${id}/deactivate`)
      .then(() => undefined),

  activate: (id: string) =>
    apiClient
      .patch<void>(`/users/${id}/activate`)
      .then(() => undefined),
};