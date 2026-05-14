import { KpiCard } from "@/features/analytics/components/KpiCard";
import type { MetricsSnapshot } from "../types/operationalReport.types";
import { Inbox, CheckCircle, Clock, Star, Timer } from "lucide-react";

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

interface Props {
  metrics: MetricsSnapshot["Summary"];
}

export function ReportMetricsCards({ metrics }: Props) {
  const variance =
    metrics.TotalEstimatedCost > 0
      ? (
          ((metrics.TotalActualCost - metrics.TotalEstimatedCost) /
            metrics.TotalEstimatedCost) *
          100
        ).toFixed(1) + "%"
      : "—";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        label="Total Requests"
        value={metrics.TotalRequests}
        icon={<Inbox className="h-5 w-5" />}
        accent="slate"
      />
      <KpiCard
        label="Deadline Compliance"
        value={
          metrics.DeadlineComplianceRate != null
            ? `${metrics.DeadlineComplianceRate.toFixed(1)}%`
            : "—"
        }
        subVariant={
          metrics.DeadlineComplianceRate == null
            ? "default"
            : metrics.DeadlineComplianceRate >= 80
              ? "success"
              : metrics.DeadlineComplianceRate >= 50
                ? "warning"
                : "danger"
        }
        icon={<CheckCircle className="h-5 w-5" />}
        accent="green"
      />
      <KpiCard
        label="Cost Variance"
        value={variance}
        sub={`Est. ${metrics.TotalEstimatedCost.toFixed(2)} · Act. ${metrics.TotalActualCost.toFixed(2)}`}
        subVariant={
          metrics.TotalActualCost <= metrics.TotalEstimatedCost
            ? "success"
            : "danger"
        }
        icon={<IconCurrency />}
        accent="blue"
      />
      <KpiCard
        label="Avg Execution"
        value={
          metrics.AvgExecutionMinutes != null
            ? `${metrics.AvgExecutionMinutes.toFixed(1)} min`
            : "—"
        }
        icon={<Clock className="h-5 w-5" />}
        accent="red"
      />
      <KpiCard
        label="Avg Survey Rating"
        value={
          metrics.AvgSurveyRating != null
            ? `${metrics.AvgSurveyRating.toFixed(2)} / 5`
            : "—"
        }
        sub={
          metrics.AvgSurveyRating == null
            ? "No surveys yet"
            : metrics.AvgSurveyRating >= 4
              ? "High satisfaction"
              : metrics.AvgSurveyRating >= 3
                ? "Room for improvement"
                : "Low satisfaction"
        }
        subVariant={
          metrics.AvgSurveyRating == null
            ? "default"
            : metrics.AvgSurveyRating >= 4
              ? "success"
              : metrics.AvgSurveyRating >= 3
                ? "warning"
                : "danger"
        }
        icon={<Star className="h-5 w-5" />}
        accent="purple"
      />
      <KpiCard
        label="Avg Queue Wait"
        value={
          metrics.AvgQueueWaitMinutes != null
            ? `${metrics.AvgQueueWaitMinutes.toFixed(0)} min`
            : "—"
        }
        sub={
          metrics.AvgQueueWaitMinutes != null &&
          metrics.AvgExecutionMinutes != null
            ? metrics.AvgQueueWaitMinutes > metrics.AvgExecutionMinutes
              ? "Queue exceeds execution — bottleneck"
              : "Queue within normal range"
            : undefined
        }
        subVariant={
          metrics.AvgQueueWaitMinutes != null &&
          metrics.AvgExecutionMinutes != null
            ? metrics.AvgQueueWaitMinutes > metrics.AvgExecutionMinutes
              ? "warning"
              : "success"
            : "default"
        }
        icon={<Timer className="h-5 w-5" />}
        accent={
          metrics.AvgQueueWaitMinutes != null &&
          metrics.AvgExecutionMinutes != null &&
          metrics.AvgQueueWaitMinutes > metrics.AvgExecutionMinutes
            ? "amber"
            : "purple"
        }
      />
    </div>
  );
}
