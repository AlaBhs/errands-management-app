import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics.api";

const analyticsKeys = {
  all: ["analytics"] as const,
  summary: () => [...analyticsKeys.all, "summary"] as const,
  trend: () => [...analyticsKeys.all, "trend"] as const,
  costBreakdown: () => [...analyticsKeys.all, "cost-breakdown"] as const,
};

export const useAnalyticsSummary = () =>
  useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: analyticsApi.getSummary,
  });

export const useAnalyticsTrend = () =>
  useQuery({
    queryKey: analyticsKeys.trend(),
    queryFn: analyticsApi.getTrend,
  });

export const useAnalyticsCostBreakdown = () =>
  useQuery({
    queryKey: analyticsKeys.costBreakdown(),
    queryFn: analyticsApi.getCostBreakdown,
  });