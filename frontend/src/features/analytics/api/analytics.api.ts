import { apiClient } from "@/shared/api/client";
import type {
  AnalyticsFilter,
  AnalyticsSummary,
  CostBreakdown,
  CourierPerformance,
  TrendPoint,
} from "../types/analytics.types";
import type { ApiResponse } from "@/shared/api/types";

const toParams = (filter: AnalyticsFilter) => ({
  ...(filter.from && { from: filter.from }),
  ...(filter.to && { to: filter.to }),
});

export const analyticsApi = {
  getSummary: async (filter: AnalyticsFilter) =>
    apiClient
      .get<ApiResponse<AnalyticsSummary>>("/analytics/summary", {
        params: toParams(filter),
      })
      .then((res) => res.data),

  getTrend: async (filter: AnalyticsFilter) =>
    apiClient
      .get<ApiResponse<TrendPoint[]>>("/analytics/trend", {
        params: toParams(filter),
      })
      .then((res) => res.data),

  getCostBreakdown: async (filter: AnalyticsFilter) =>
    apiClient
      .get<
        ApiResponse<CostBreakdown[]>
      >("/analytics/cost-breakdown", { params: toParams(filter) })
      .then((res) => res.data),

  getCourierPerformance: async (filter: AnalyticsFilter) =>
    apiClient
      .get<
        ApiResponse<CourierPerformance[]>
      >("/analytics/courier-performance", { params: toParams(filter) })
      .then((res) => res.data),

  getMyCourierPerformance: async (days = 30) =>
    apiClient
      .get<
        ApiResponse<CourierPerformance>
      >("/analytics/my-performance", { params: { days } })
      .then((res) => res.data),
};
