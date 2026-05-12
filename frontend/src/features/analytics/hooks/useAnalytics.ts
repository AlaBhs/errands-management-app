import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics.api";
import type { AnalyticsFilter } from "../types/analytics.types";

const analyticsKeys = {
  all: () => ["analytics"] as const,
  summary: (f: AnalyticsFilter) =>
    [...analyticsKeys.all(), "summary", f] as const,
  trend: (f: AnalyticsFilter) => [...analyticsKeys.all(), "trend", f] as const,
  costBreakdown: (f: AnalyticsFilter) =>
    [...analyticsKeys.all(), "cost-breakdown", f] as const,
  courierPerformance: (f: AnalyticsFilter) =>
    [...analyticsKeys.all(), "courier-performance", f] as const,
  myPerformance: (days: number) =>
    [...analyticsKeys.all(), "my-performance", days] as const,
};

export const useAnalyticsSummary = (filter: AnalyticsFilter) =>
  useQuery({
    queryKey: analyticsKeys.summary(filter),
    queryFn: () => analyticsApi.getSummary(filter),
    select: (res) => res.data,
  });

export const useAnalyticsTrend = (filter: AnalyticsFilter) =>
  useQuery({
    queryKey: analyticsKeys.trend(filter),
    queryFn: () => analyticsApi.getTrend(filter),
    select: (res) => res.data,
  });

export const useAnalyticsCostBreakdown = (filter: AnalyticsFilter) =>
  useQuery({
    queryKey: analyticsKeys.costBreakdown(filter),
    queryFn: () => analyticsApi.getCostBreakdown(filter),
    select: (res) => res.data,
  });

export const useAnalyticsCourierPerformance = (filter: AnalyticsFilter) =>
  useQuery({
    queryKey: analyticsKeys.courierPerformance(filter),
    queryFn: () => analyticsApi.getCourierPerformance(filter),
    select: (res) => res.data,
  });

export const useAnalyticsMyCourierPerformance = (days = 30) =>
  useQuery({
    queryKey: analyticsKeys.myPerformance(days),
    queryFn: () => analyticsApi.getMyCourierPerformance(days),
    select: (res) => res.data,
  });