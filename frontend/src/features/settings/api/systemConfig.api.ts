import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';
import type {
  SystemConfigurationDto,
  RecommendationPolicyDto,
  SlaPolicyDto,
  ExpensePolicyDto,
  NotificationPolicyDto,
  RequestPolicyDto,
  ConfigurationChangeLogDto,
  PublicConfigDto,
  ChangelogParams,
} from '../types/systemConfig.types';

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const systemConfigApi = {
  getConfig: () =>
    apiClient
      .get<ApiResponse<SystemConfigurationDto>>('/system-config')
      .then((r) => r.data.data),

  getPublicConfig: () =>
    apiClient
      .get<ApiResponse<PublicConfigDto>>('/system-config/public')
      .then((r) => r.data.data),

  updateRecommendation: (data: RecommendationPolicyDto) =>
    apiClient.put('/system-config/recommendation', data).then((r) => r.data),

  updateSla: (data: SlaPolicyDto) =>
    apiClient.put('/system-config/sla', data).then((r) => r.data),

  updateExpense: (data: ExpensePolicyDto) =>
    apiClient.put('/system-config/expense', data).then((r) => r.data),

  updateNotifications: (data: NotificationPolicyDto) =>
    apiClient.put('/system-config/notifications', data).then((r) => r.data),

  updateRequests: (data: RequestPolicyDto) =>
    apiClient.put('/system-config/requests', data).then((r) => r.data),

  getChangelog: (params: ChangelogParams) =>
    apiClient
      .get<ApiResponse<PagedResult<ConfigurationChangeLogDto>>>('/system-config/changelog', { params })
      .then((r) => r.data.data),
};