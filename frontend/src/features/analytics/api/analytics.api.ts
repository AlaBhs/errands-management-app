import { apiClient } from "@/shared/api/client";
import type {
  AnalyticsSummary,
  CostBreakdown,
  CourierPerformance,
  TrendPoint,
} from "../types";

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const { data } =
      await apiClient.get<AnalyticsSummary>("/analytics/summary");
    return data;
  },

  getTrend: async (): Promise<TrendPoint[]> => {
    const { data } = await apiClient.get<TrendPoint[]>("/analytics/trend");
    return data;
  },

  getCostBreakdown: async (): Promise<CostBreakdown[]> => {
    const { data } = await apiClient.get<CostBreakdown[]>(
      "/analytics/cost-breakdown",
    );
    return data;
  },

  getCourierPerformance: async (): Promise<CourierPerformance[]> => {
    const { data } = await apiClient.get<CourierPerformance[]>(
      "/analytics/courier-performance",
    );
    return data;
  },
};
