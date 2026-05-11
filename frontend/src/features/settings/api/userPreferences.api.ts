import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';
import type {
  UserPreferencesDto,
  UpdatePreferencesPayload,
  UpdateCollaboratorDefaultsPayload,
  UpdateCourierDefaultsPayload,
} from '../types/userPreferences.types';

export const userPreferencesApi = {
  getPreferences: () =>
    apiClient
      .get<ApiResponse<UserPreferencesDto>>('/me/preferences')
      .then((r) => r.data.data),

  updatePreferences: (data: UpdatePreferencesPayload) =>
    apiClient.put('/me/preferences', data).then((r) => r.data),

  updateCollaboratorDefaults: (data: UpdateCollaboratorDefaultsPayload) =>
    apiClient.put('/me/preferences/collaborator', data).then((r) => r.data),

  updateCourierDefaults: (data: UpdateCourierDefaultsPayload) =>
    apiClient.put('/me/preferences/courier', data).then((r) => r.data),
};