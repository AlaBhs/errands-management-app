import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isApiError } from '@/shared/api/client';
import { userPreferencesApi } from '../api/userPreferences.api';
import { settingsKeys } from './settingsKeys';
import type {
  UpdatePreferencesPayload,
  UpdateCollaboratorDefaultsPayload,
  UpdateCourierDefaultsPayload,
} from '../types/userPreferences.types';

export function useUserPreferences() {
  return useQuery({
    queryKey: settingsKeys.prefs(),
    queryFn:  userPreferencesApi.getPreferences,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePreferencesPayload) =>
      userPreferencesApi.updatePreferences(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.prefs() });
      toast.success('Preferences saved.');
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : 'Failed to save preferences.'),
  });
}

export function useUpdateCollaboratorDefaults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCollaboratorDefaultsPayload) =>
      userPreferencesApi.updateCollaboratorDefaults(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.prefs() });
      toast.success('Request defaults saved.');
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : 'Failed to save request defaults.'),
  });
}

export function useUpdateCourierDefaults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCourierDefaultsPayload) =>
      userPreferencesApi.updateCourierDefaults(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.prefs() });
      toast.success('Courier defaults saved.');
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : 'Failed to save courier defaults.'),
  });
}