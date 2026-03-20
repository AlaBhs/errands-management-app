import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics.api";
import type { AnalyticsFilter } from "../types/analytics.types";

const analyticsKeys = {
  all:                () => ["analytics"]                              as const,
  summary:            (f: AnalyticsFilter) => [...analyticsKeys.all(), "summary",             f] as const,
  trend:              (f: AnalyticsFilter) => [...analyticsKeys.all(), "trend",               f] as const,
  costBreakdown:      (f: AnalyticsFilter) => [...analyticsKeys.all(), "cost-breakdown",      f] as const,
  courierPerformance: (f: AnalyticsFilter) => [...analyticsKeys.all(), "courier-performance", f] as const,
};

export const useAnalyticsSummary = (filter: AnalyticsFilter) =>
  useQuery({
    queryKey: analyticsKeys.summary(filter),
    queryFn:  () => analyticsApi.getSummary(filter),
  });

export const useAnalyticsTrend = (filter: AnalyticsFilter) =>
  useQuery({
    queryKey: analyticsKeys.trend(filter),
    queryFn:  () => analyticsApi.getTrend(filter),
  });

export const useAnalyticsCostBreakdown = (filter: AnalyticsFilter) =>
  useQuery({
    queryKey: analyticsKeys.costBreakdown(filter),
    queryFn:  () => analyticsApi.getCostBreakdown(filter),
  });

export const useAnalyticsCourierPerformance = (filter: AnalyticsFilter) =>
  useQuery({
    queryKey: analyticsKeys.courierPerformance(filter),
    queryFn:  () => analyticsApi.getCourierPerformance(filter),
  });