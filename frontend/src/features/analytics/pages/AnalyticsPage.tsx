import { useState } from "react";
import { ErrorMessage }            from "@/shared/components/ErrorMessage";
import { CategoryBarChart }        from "../components/CategoryBarChart";
import { CostBreakdownTable }      from "../components/CostBreakdownTable";
import { CourierPerformanceTable } from "../components/CourierPerformanceTable";
import { DateRangeFilter }         from "../components/DateRangeFilter";
import { KpiCard }                 from "../components/KpiCard";
import { KpiCardSkeleton }         from "../components/KpiCardSkeleton";
import { PipelineTimingCard }      from "../components/PipelineTimingCard";
import { TrendChart }              from "../components/TrendChart";
import { WidgetEmptyState }        from "../components/WidgetEmptyState";
import { WidgetSkeleton }          from "../components/WidgetSkeleton";
import {
  useAnalyticsCostBreakdown,
  useAnalyticsCourierPerformance,
  useAnalyticsSummary,
  useAnalyticsTrend,
} from "../hooks/useAnalytics";
import type { AnalyticsFilter }    from "../types/analytics.types";

const toIsoDate = (d: Date): string => d.toISOString().split("T")[0];

const DEFAULT_FILTER: AnalyticsFilter = {
  from: toIsoDate(new Date(Date.now() - 30 * 86_400_000)),
  to:   toIsoDate(new Date()),
};

export const AnalyticsPage = () => {
  const [filter, setFilter] = useState<AnalyticsFilter>(DEFAULT_FILTER);

  const summary            = useAnalyticsSummary(filter);
  const trend              = useAnalyticsTrend(filter);
  const costBreakdown      = useAnalyticsCostBreakdown(filter);
  const courierPerformance = useAnalyticsCourierPerformance(filter);

  // Derived summary values — only computed when data is available
  const s = summary.data;
  const completedCount  = s?.byStatus["Completed"] ?? 0;
  const avgRatingLabel  =
    s?.avgSurveyRating != null
      ? `${s.avgSurveyRating.toFixed(2)} / 5`
      : "—";

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all errand requests
        </p>
      </div>

      {/* ── Date range filter ── */}
      <DateRangeFilter
        filter={filter}
        onPreset={setFilter}
        onApply={setFilter}
      />

      {/* ── KPI Cards ── */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {summary.isLoading ? (
          // Show 6 skeleton cards matching the real layout
          Array.from({ length: 6 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))
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
                    : Math.round((completedCount / s.totalRequests) * 100) >= 40
                      ? "warning"
                      : "danger"
              }
            />
            <KpiCard
              label="Active Requests"
              value={
                (s.byStatus["Assigned"] ?? 0) +
                (s.byStatus["InProgress"] ?? 0)
              }
              sub={(() => {
                const assigned   = s.byStatus["Assigned"]   ?? 0;
                const inProgress = s.byStatus["InProgress"] ?? 0;
                if (assigned === 0 && inProgress === 0) return "None in flight";
                if (assigned === 0)   return `${inProgress} in progress`;
                if (inProgress === 0) return `${assigned} awaiting pickup`;
                return `${inProgress} in progress · ${assigned} awaiting pickup`;
              })()}
              subVariant="default"
            />
            <KpiCard
              label="Avg Survey Rating"
              value={avgRatingLabel}
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
            />
            <KpiCard
              label="Cost Variance"
              value={
                s.totalEstimatedCost > 0
                  ? `${(((s.totalActualCost - s.totalEstimatedCost) /
                      s.totalEstimatedCost) * 100).toFixed(1)}%`
                  : "—"
              }
              sub={
                s.totalEstimatedCost === 0
                  ? "No estimates set"
                  : s.totalActualCost <= s.totalEstimatedCost
                    ? `Saved ${(s.totalEstimatedCost - s.totalActualCost)
                        .toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })}`
                    : `Over by ${(s.totalActualCost - s.totalEstimatedCost)
                        .toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })}`
              }
              subVariant={
                s.totalEstimatedCost === 0
                  ? "default"
                  : s.totalActualCost <= s.totalEstimatedCost
                    ? "success"
                    : "danger"
              }
            />
          </>
        ) : (
          // summary returned but data is empty/null — zero requests in period
          <div className="col-span-2 sm:col-span-3">
            <WidgetEmptyState message="No requests found for the selected period." />
          </div>
        )}
      </section>

      {/* ── Pipeline Timing ── */}
      {summary.isLoading ? (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 h-4 w-48 animate-pulse rounded bg-muted" />
          <WidgetSkeleton type="bars" rows={3} />
        </div>
      ) : s && (
        s.avgQueueWaitMinutes != null ||
        s.avgPickupDelayMinutes != null ||
        s.avgExecutionMinutes != null
      ) ? (
        <PipelineTimingCard
          avgQueueWaitMinutes={s!.avgQueueWaitMinutes}
          avgPickupDelayMinutes={s!.avgPickupDelayMinutes}
          avgExecutionMinutes={s!.avgExecutionMinutes}
          avgLifecycleMinutes={s!.avgLifecycleMinutes}
        />
      ) : !summary.isLoading && !summary.isError ? (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">
            Request Pipeline Timing
          </h2>
          <WidgetEmptyState message="No completed requests in the selected period." />
        </div>
      ) : null}

      {/* ── Category + Trend ── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Category breakdown */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">
            Requests by Category
          </h2>
          {summary.isLoading ? (
            <WidgetSkeleton type="bars" rows={5} />
          ) : summary.isError ? (
            <ErrorMessage message="Failed to load category data." />
          ) : s && Object.keys(s.byCategory).length > 0 ? (
            <CategoryBarChart data={s.byCategory} />
          ) : (
            <WidgetEmptyState />
          )}
        </div>

        {/* Trend chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">
            Monthly Trend
            {!filter.from && !filter.to ? " (last 6 months)" : ""}
          </h2>
          {trend.isLoading ? (
            // Bar chart skeleton
            <div className="flex h-40 animate-pulse items-end gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-muted"
                  style={{ height: `${40 + i * 12}%` }}
                />
              ))}
            </div>
          ) : trend.isError ? (
            <ErrorMessage message="Failed to load trend data." />
          ) : trend.data && trend.data.some((p) => p.count > 0) ? (
            <TrendChart data={trend.data} />
          ) : (
            <WidgetEmptyState />
          )}
        </div>

      </section>

      {/* ── Cost Breakdown ── */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">
          Cost Breakdown by Category
        </h2>
        {costBreakdown.isLoading ? (
          <WidgetSkeleton type="rows" rows={5} />
        ) : costBreakdown.isError ? (
          <ErrorMessage message="Failed to load cost data." />
        ) : costBreakdown.data && costBreakdown.data.length > 0 &&
          costBreakdown.data.some(
            (r) => r.estimatedCost > 0 || r.actualCost > 0) ? (
          <CostBreakdownTable data={costBreakdown.data} />
        ) : (
          <WidgetEmptyState message="No cost data available for the selected period." />
        )}
      </section>

      {/* ── Courier Performance ── */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold">Courier Performance</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Filtered by request creation date. On-time rate excludes requests
          with no deadline.
        </p>
        {courierPerformance.isLoading ? (
          <WidgetSkeleton type="rows" rows={2} />
        ) : courierPerformance.isError ? (
          <ErrorMessage message="Failed to load courier data." />
        ) : courierPerformance.data && courierPerformance.data.length > 0 ? (
          <CourierPerformanceTable data={courierPerformance.data} />
        ) : (
          <WidgetEmptyState message="No courier assignments in the selected period." />
        )}
      </section>

    </div>
  );
};