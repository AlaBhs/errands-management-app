import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isApiError } from '@/shared/api/client';
import { systemConfigApi } from '../api/systemConfig.api';
import { settingsKeys } from './settingsKeys';
import type {
  RecommendationPolicyDto,
  SlaPolicyDto,
  ExpensePolicyDto,
  NotificationPolicyDto,
  RequestPolicyDto,
  ChangelogParams,
} from '../types/systemConfig.types';

export function useSystemConfig() {
  return useQuery({
    queryKey: settingsKeys.config(),
    queryFn:  systemConfigApi.getConfig,
  });
}

export function usePublicConfig() {
  return useQuery({
    queryKey:  settingsKeys.publicConfig(),
    queryFn:   systemConfigApi.getPublicConfig,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChangelog(params: ChangelogParams) {
  return useQuery({
    queryKey: settingsKeys.changelog(params),
    queryFn:  () => systemConfigApi.getChangelog(params),
  });
}

// ── Private helper ─────────────────────────────────────────────────────────────

function useConfigMutation<T>(
  mutationFn: (data: T) => Promise<unknown>,
  sectionLabel: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.config() });
      qc.invalidateQueries({ queryKey: ['settings', 'changelog'] });
      toast.success(`${sectionLabel} saved.`);
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : `Failed to save ${sectionLabel}.`),
  });
}

// ── Exported mutation hooks ────────────────────────────────────────────────────

export const useUpdateRecommendation = () =>
  useConfigMutation<RecommendationPolicyDto>(
    systemConfigApi.updateRecommendation,
    'Recommendation Policy',
  );

export const useUpdateSla = () =>
  useConfigMutation<SlaPolicyDto>(systemConfigApi.updateSla, 'SLA Policy');

export const useUpdateExpense = () =>
  useConfigMutation<ExpensePolicyDto>(systemConfigApi.updateExpense, 'Expense Policy');

export const useUpdateNotificationPolicy = () =>
  useConfigMutation<NotificationPolicyDto>(
    systemConfigApi.updateNotifications,
    'Notification Policy',
  );

export const useUpdateRequestPolicy = () =>
  useConfigMutation<RequestPolicyDto>(
    systemConfigApi.updateRequests,
    'Request Policy',
  );