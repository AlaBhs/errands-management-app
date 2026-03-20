import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { CategoryBarChart } from "../components/CategoryBarChart";
import { CostBreakdownTable } from "../components/CostBreakdownTable";
import { CourierPerformanceTable } from "../components/CourierPerformanceTable";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { KpiCard } from "../components/KpiCard";
import { KpiCardSkeleton } from "../components/skeletons/KpiCardSkeleton";
import { PipelineTimingCard } from "../components/PipelineTimingCard";

import { TrendChart } from "../components/TrendChart";
import { WidgetEmptyState } from "../components/WidgetEmptyState";
import {
  useAnalyticsCostBreakdown,
  useAnalyticsCourierPerformance,
  useAnalyticsSummary,
  useAnalyticsTrend,
} from "../hooks/useAnalytics";
import type { AnalyticsFilter } from "../types/analytics.types";
import { StatusDistributionCard } from "../components/StatusDistributionCard";
import { StatusDistributionSkeleton } from "../components/skeletons/StatusDistributionSkeleton";
import { PipelineTimingSkeleton } from "../components/skeletons/PipelineTimingSkeleton";
import { CategoryChartSkeleton } from "../components/skeletons/CategoryChartSkeleton";
import { TrendChartSkeleton } from "../components/skeletons/TrendChartSkeleton";
import { CostBreakdownSkeleton } from "../components/skeletons/CostBreakdownSkeleton";
import { CourierPerformanceSkeleton } from "../components/skeletons/CourierPerformanceSkeleton";

// ── Icons (inline SVG — no new dep) ───────────────────────────────────────────
const IconInbox = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
    />
  </svg>
);
const IconCheck = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconBolt = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
    />
  </svg>
);
const IconStar = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);
const IconClock = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconCurrency = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const toIsoDate = (d: Date): string => d.toISOString().split("T")[0];

const DEFAULT_FILTER: AnalyticsFilter = {
  from: toIsoDate(new Date(Date.now() - 30 * 86_400_000)),
  to: toIsoDate(new Date()),
};

export const AnalyticsPage = () => {
  const [filter, setFilter] = useState<AnalyticsFilter>(DEFAULT_FILTER);

  const summary = useAnalyticsSummary(filter);
  const trend = useAnalyticsTrend(filter);
  const costBreakdown = useAnalyticsCostBreakdown(filter);
  const courierPerformance = useAnalyticsCourierPerformance(filter);

  const s = summary.data;
  const completedCount = s?.byStatus["Completed"] ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="border-b bg-card px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Operational overview of all errand requests
            </p>
          </div>
          {s && (
            <div className="hidden items-center gap-6 text-sm sm:flex">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums">
                  {s.totalRequests}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {completedCount}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-[var(--chart-1)]">
                  {(s.byStatus["Assigned"] ?? 0) +
                    (s.byStatus["InProgress"] ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-rose-500 dark:text-rose-400">
                  {s.byStatus["Cancelled"] ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-20 -mx-6 -mt-6 px-6 pt-4 pb-2
                        bg-background/95 backdrop-blur-sm border-b border-transparent
                        [&:not(:first-child)]:border-border transition-all"
        >
          <DateRangeFilter
            filter={filter}
            onPreset={setFilter}
            onApply={setFilter}
          />
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {summary.isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : summary.isError ? (
            <div className="col-span-2 sm:col-span-3">
              <ErrorMessage message="Failed to load summary data." />
            </div>
          ) : s ? (
            <>
              <KpiCard
                label="Total Requests"
                value={s.totalRequests}
                sub={`${s.byStatus["Cancelled"] ?? 0} cancelled`}
                subVariant="default"
                icon={<IconInbox />}
                accent="slate"
              />
              <KpiCard
                label="Completed"
                value={completedCount}
                sub={
                  s.totalRequests > 0
                    ? `${Math.round((completedCount / s.totalRequests) * 100)}% of total`
                    : "No requests yet"
                }
                subVariant={
                  s.totalRequests === 0
                    ? "default"
                    : Math.round((completedCount / s.totalRequests) * 100) >= 70
                      ? "success"
                      : Math.round((completedCount / s.totalRequests) * 100) >=
                          40
                        ? "warning"
                        : "danger"
                }
                icon={<IconCheck />}
                accent="green"
              />
              <KpiCard
                label="Active Requests"
                value={
                  (s.byStatus["Assigned"] ?? 0) +
                  (s.byStatus["InProgress"] ?? 0)
                }
                sub={(() => {
                  const assigned = s.byStatus["Assigned"] ?? 0;
                  const inProgress = s.byStatus["InProgress"] ?? 0;
                  if (assigned === 0 && inProgress === 0)
                    return "None in flight";
                  if (assigned === 0) return `${inProgress} in progress`;
                  if (inProgress === 0) return `${assigned} awaiting pickup`;
                  return `${inProgress} in progress · ${assigned} awaiting pickup`;
                })()}
                subVariant="default"
                icon={<IconBolt />}
                accent="blue"
              />
              <KpiCard
                label="Avg Survey Rating"
                value={
                  s.avgSurveyRating != null
                    ? `${s.avgSurveyRating.toFixed(2)} / 5`
                    : "—"
                }
                sub={
                  s.avgSurveyRating != null
                    ? s.avgSurveyRating >= 4
                      ? "High satisfaction"
                      : s.avgSurveyRating >= 3
                        ? "Room for improvement"
                        : "Low satisfaction"
                    : "No surveys yet"
                }
                subVariant={
                  s.avgSurveyRating == null
                    ? "default"
                    : s.avgSurveyRating >= 4
                      ? "success"
                      : s.avgSurveyRating >= 3
                        ? "warning"
                        : "danger"
                }
                icon={<IconStar />}
                accent="amber"
              />
              <KpiCard
                label="Deadline Compliance"
                value={
                  s.deadlineComplianceRate != null
                    ? `${s.deadlineComplianceRate.toFixed(1)}%`
                    : "—"
                }
                sub={
                  s.deadlineComplianceRate != null
                    ? s.deadlineComplianceRate >= 80
                      ? "On track"
                      : s.deadlineComplianceRate >= 50
                        ? "Needs attention"
                        : "Critical"
                    : "No deadlines set"
                }
                subVariant={
                  s.deadlineComplianceRate == null
                    ? "default"
                    : s.deadlineComplianceRate >= 80
                      ? "success"
                      : s.deadlineComplianceRate >= 50
                        ? "warning"
                        : "danger"
                }
                icon={<IconClock />}
                accent="purple"
              />
              <KpiCard
                label="Cost Variance"
                value={
                  s.totalEstimatedCost > 0
                    ? `${(((s.totalActualCost - s.totalEstimatedCost) / s.totalEstimatedCost) * 100).toFixed(1)}%`
                    : "—"
                }
                sub={
                  s.totalEstimatedCost === 0
                    ? "No estimates set"
                    : s.totalActualCost <= s.totalEstimatedCost
                      ? `Saved ${(s.totalEstimatedCost - s.totalActualCost).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`
                      : `Over by ${(s.totalActualCost - s.totalEstimatedCost).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`
                }
                subVariant={
                  s.totalEstimatedCost === 0
                    ? "default"
                    : s.totalActualCost <= s.totalEstimatedCost
                      ? "success"
                      : "danger"
                }
                icon={<IconCurrency />}
                accent={
                  s.totalEstimatedCost === 0 ||
                  s.totalActualCost <= s.totalEstimatedCost
                    ? "green"
                    : "red"
                }
              />
            </>
          ) : (
            <div className="col-span-2 sm:col-span-3">
              <WidgetEmptyState message="No requests found for the selected period." />
            </div>
          )}
        </section>

        {/* ── Status Distribution + Pipeline Timing ─────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Status distribution */}
          <div className="rounded-xl border-0 bg-transparent p-0 shadow-none">
            {summary.isLoading ? (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <StatusDistributionSkeleton />
              </div>
            ) : summary.isError ? (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <ErrorMessage message="Failed to load status data." />
              </div>
            ) : s && Object.keys(s.byStatus).length > 0 ? (
              <StatusDistributionCard data={s.byStatus} />
            ) : (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <WidgetEmptyState />
              </div>
            )}
          </div>

          {/* Pipeline timing */}
          {summary.isLoading ? (
            <PipelineTimingSkeleton />
          ) : s &&
            (s.avgQueueWaitMinutes != null ||
              s.avgPickupDelayMinutes != null ||
              s.avgExecutionMinutes != null) ? (
            <PipelineTimingCard
              avgQueueWaitMinutes={s.avgQueueWaitMinutes}
              avgPickupDelayMinutes={s.avgPickupDelayMinutes}
              avgExecutionMinutes={s.avgExecutionMinutes}
              avgLifecycleMinutes={s.avgLifecycleMinutes}
            />
          ) : !summary.isLoading && !summary.isError ? (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">
                Request Pipeline Timing
              </h2>
              <WidgetEmptyState message="No completed requests in the selected period." />
            </div>
          ) : null}
        </section>

        {/* ── Category Breakdown + Trend ────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-1 text-base font-semibold">
              Requests by Category
            </h2>
            <p className="mb-5 text-xs text-muted-foreground">
              Volume distribution across all request categories
            </p>
            {summary.isLoading ? (
              <CategoryChartSkeleton />
            ) : summary.isError ? (
              <ErrorMessage message="Failed to load category data." />
            ) : s && Object.keys(s.byCategory).length > 0 ? (
              <CategoryBarChart data={s.byCategory} />
            ) : (
              <WidgetEmptyState />
            )}
          </div>

          <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-1 text-base font-semibold">Monthly Trend</h2>
            <p className="mb-5 text-xs text-muted-foreground">
              {!filter.from && !filter.to
                ? "Request volume over the last 6 months"
                : "Request volume over the selected period"}
            </p>

            {/* Peak month stat */}
            {trend.data && (
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Peak month</p>
                  <p className="text-lg font-bold tabular-nums">
                    {Math.max(...trend.data.map((d) => d.count))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Avg per month</p>
                  <p className="text-lg font-bold tabular-nums">
                    {trend.data.length > 0
                      ? (
                          trend.data.reduce((s, d) => s + d.count, 0) /
                          trend.data.length
                        ).toFixed(1)
                      : "—"}
                  </p>
                </div>
              </div>
            )}

            {/* Chart area — flex-1 makes it fill remaining space */}
            <div className="flex-1 min-h-0">
              {trend.isLoading ? (
                <TrendChartSkeleton />
              ) : trend.isError ? (
                <ErrorMessage message="Failed to load trend data." />
              ) : trend.data && trend.data.some((p) => p.count > 0) ? (
                <TrendChart data={trend.data} />
              ) : (
                <WidgetEmptyState />
              )}
            </div>
          </div>
        </section>

        {/* ── Cost Breakdown ────────────────────────────────────────────────── */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold">
                Cost Breakdown by Category
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Estimated vs actual spend with variance analysis
              </p>
            </div>
            {costBreakdown.data && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total actual</p>
                <p className="text-base font-bold tabular-nums">
                  {costBreakdown.data
                    .reduce((s, r) => s + r.actualCost, 0)
                    .toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                </p>
              </div>
            )}
          </div>
          {costBreakdown.isLoading ? (
            <CostBreakdownSkeleton />
          ) : costBreakdown.isError ? (
            <ErrorMessage message="Failed to load cost data." />
          ) : costBreakdown.data &&
            costBreakdown.data.length > 0 &&
            costBreakdown.data.some(
              (r) => r.estimatedCost > 0 || r.actualCost > 0,
            ) ? (
            <CostBreakdownTable data={costBreakdown.data} />
          ) : (
            <WidgetEmptyState message="No cost data available for the selected period." />
          )}
        </section>

        {/* ── Courier Performance ───────────────────────────────────────────── */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold">Courier Performance</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Filtered by request creation date · On-time rate excludes
                requests with no deadline
              </p>
            </div>
          </div>
          {courierPerformance.isLoading ? (
            <CourierPerformanceSkeleton />
          ) : courierPerformance.isError ? (
            <ErrorMessage message="Failed to load courier data." />
          ) : courierPerformance.data && courierPerformance.data.length > 0 ? (
            <CourierPerformanceTable data={courierPerformance.data} />
          ) : (
            <WidgetEmptyState message="No courier assignments in the selected period." />
          )}
        </section>
      </div>
    </div>
  );
};
