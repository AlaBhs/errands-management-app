import { apiClient } from "@/shared/api/client";
import type {
  AnalyticsFilter,
  AnalyticsSummary,
  CostBreakdown,
  CourierPerformance,
  TrendPoint,
} from "../types/analytics.types";

const toParams = (filter: AnalyticsFilter) => ({
  ...(filter.from && { from: filter.from }),
  ...(filter.to && { to: filter.to }),
});

export const analyticsApi = {
  getSummary: async (filter: AnalyticsFilter): Promise<AnalyticsSummary> => {
    const { data } = await apiClient.get<AnalyticsSummary>(
      "/analytics/summary",
      { params: toParams(filter) },
    );
    return data;
  },

  getTrend: async (filter: AnalyticsFilter): Promise<TrendPoint[]> => {
    const { data } = await apiClient.get<TrendPoint[]>("/analytics/trend", {
      params: toParams(filter),
    });
    return data;
  },

  getCostBreakdown: async (
    filter: AnalyticsFilter,
  ): Promise<CostBreakdown[]> => {
    const { data } = await apiClient.get<CostBreakdown[]>(
      "/analytics/cost-breakdown",
      { params: toParams(filter) },
    );
    return data;
  },

  getCourierPerformance: async (
    filter: AnalyticsFilter,
  ): Promise<CourierPerformance[]> => {
    const { data } = await apiClient.get<CourierPerformance[]>(
      "/analytics/courier-performance",
      { params: toParams(filter) },
    );
    return data;
  },
};
