import { KpiCard } from "@/features/analytics/components/KpiCard";
import type { MetricsSnapshot } from "../types/operationalReport.types";

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

interface Props {
  metrics: MetricsSnapshot["Summary"];
}

export function ReportMetricsCards({ metrics }: Props) {
  const variance =
    metrics.totalEstimatedCost > 0
      ? (
          ((metrics.totalActualCost - metrics.totalEstimatedCost) /
            metrics.totalEstimatedCost) *
          100
        ).toFixed(1) + "%"
      : "—";

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <KpiCard
        label="Total Requests"
        value={metrics.totalRequests}
        icon={<IconInbox />}
        accent="slate"
      />
      <KpiCard
        label="Deadline Compliance"
        value={
          metrics.deadlineComplianceRate != null
            ? `${metrics.deadlineComplianceRate.toFixed(1)}%`
            : "—"
        }
        subVariant={
          metrics.deadlineComplianceRate == null
            ? "default"
            : metrics.deadlineComplianceRate >= 80
              ? "success"
              : metrics.deadlineComplianceRate >= 50
                ? "warning"
                : "danger"
        }
        icon={<IconCheck />}
        accent="green"
      />
      <KpiCard
        label="Cost Variance"
        value={variance}
        sub={`Est. ${metrics.totalEstimatedCost.toFixed(2)} · Act. ${metrics.totalActualCost.toFixed(2)}`}
        subVariant={
          metrics.totalActualCost <= metrics.totalEstimatedCost
            ? "success"
            : "danger"
        }
        icon={<IconCurrency />}
        accent={
          metrics.totalActualCost <= metrics.totalEstimatedCost
            ? "green"
            : "red"
        }
      />
      <KpiCard
        label="Avg Execution"
        value={
          metrics.avgExecutionMinutes != null
            ? `${metrics.avgExecutionMinutes.toFixed(1)} min`
            : "—"
        }
        icon={<IconClock />}
        accent="blue"
      />
    </div>
  );
}
