import { PageSpinner } from "@/shared/components/PageSpinner";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { CategoryBarChart } from "../components/CategoryBarChart";
import { CostBreakdownTable } from "../components/CostBreakdownTable";
import { KpiCard } from "../components/KpiCard";
import { TrendChart } from "../components/TrendChart";
import {
  useAnalyticsCostBreakdown,
  useAnalyticsCourierPerformance,
  useAnalyticsSummary,
  useAnalyticsTrend,
} from "../hooks/useAnalytics";
import { CourierPerformanceTable } from "../components/CourierPerformanceTable";
import { PipelineTimingCard } from "../components/PipelineTimingCard";

export const AnalyticsPage = () => {
  const summary = useAnalyticsSummary();
  const trend = useAnalyticsTrend();
  const costBreakdown = useAnalyticsCostBreakdown();
  const courierPerformance = useAnalyticsCourierPerformance();

  const isLoading =
    summary.isLoading ||
    trend.isLoading ||
    costBreakdown.isLoading ||
    courierPerformance.isLoading;
  const isError =
    summary.isError ||
    trend.isError ||
    costBreakdown.isError ||
    courierPerformance.isError;

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorMessage message="Failed to load analytics data." />;

  const s = summary.data!;

  const completedCount = s.byStatus["Completed"] ?? 0;

  const avgRatingLabel =
    s.avgSurveyRating != null ? `${s.avgSurveyRating.toFixed(2)} / 5` : "—";

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all errand requests
        </p>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Requests" value={s.totalRequests} />
        <KpiCard
          label="Completed"
          value={completedCount}
          sub={
            s.totalRequests > 0
              ? `${Math.round((completedCount / s.totalRequests) * 100)}% of total`
              : undefined
          }
        />
          <KpiCard
    label="Active Requests"
    value={(s.byStatus["Assigned"] ?? 0) + (s.byStatus["InProgress"] ?? 0)}
    sub={
      (() => {
        const assigned   = s.byStatus["Assigned"]   ?? 0;
        const inProgress = s.byStatus["InProgress"] ?? 0;
        if (assigned === 0 && inProgress === 0) return "None in flight";
        if (assigned === 0)   return `${inProgress} in progress`;
        if (inProgress === 0) return `${assigned} awaiting pickup`;
        return `${inProgress} in progress · ${assigned} awaiting pickup`;
      })()
    }
    subVariant="default"
  />
        <KpiCard label="Avg Survey Rating" value={avgRatingLabel} />
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
              ? `${(((s.totalActualCost - s.totalEstimatedCost) / s.totalEstimatedCost) * 100).toFixed(1)}%`
              : "—"
          }
          sub={
            s.totalActualCost <= s.totalEstimatedCost
              ? "Under budget"
              : "Over budget"
          }
        />
      </section>
      {/* Pipeline Timing */}
      <PipelineTimingCard
        avgQueueWaitMinutes={s.avgQueueWaitMinutes}
        avgPickupDelayMinutes={s.avgPickupDelayMinutes}
        avgExecutionMinutes={s.avgExecutionMinutes}
        avgLifecycleMinutes={s.avgLifecycleMinutes}
      />
      {/* Category breakdown + Trend */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Requests by Category</h2>
          <CategoryBarChart data={s.byCategory} />
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">
            Monthly Trend (last 6 months)
          </h2>
          {trend.data && trend.data.length > 0 ? (
            <TrendChart data={trend.data} />
          ) : (
            <p className="text-sm text-muted-foreground">No data available.</p>
          )}
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">
          Cost Breakdown by Category
        </h2>
        {costBreakdown.data && costBreakdown.data.length > 0 ? (
          <CostBreakdownTable data={costBreakdown.data} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No cost data available.
          </p>
        )}
      </section>
      {/* Courier Performance */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold">Courier Performance</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Execution time and ratings are calculated from completed assignments
          only. On-time rate excludes requests with no deadline.
        </p>
        <CourierPerformanceTable data={courierPerformance.data ?? []} />
      </section>
    </div>
  );
};
