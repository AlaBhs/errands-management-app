import { Link, useNavigate }           from "react-router-dom";
import { Skeleton }                    from "@/components/ui/skeleton";
import { DashboardHeader }             from "./DashboardHeader";
import { StatusDistributionCard }      from "@/features/analytics/components/StatusDistributionCard";
import { StatusDistributionSkeleton }  from "@/features/analytics/components/skeletons/StatusDistributionSkeleton";
import { StatusBadge }                 from "@/shared/components/StatusBadge";
import { PriorityBadge }               from "@/shared/components/PriorityBadge";
import { formatDate }                  from "@/shared/utils/date";
import type { RequestStatus,
              PriorityLevel }          from "@/features/requests/types";
import { cn } from "@/shared/utils/utils";


interface DashboardLayoutProps {
  title:       string;
  subtitle:    string;
  statusData?: Record<string, number>;
  isLoading:   boolean;
  items:       Array<{
    id:        string;
    title:     string;
    status:    RequestStatus;
    deadline?: string;
    priority:  PriorityLevel;
  }>;
  viewAllLink:   string;
  viewAllLabel:  string;
  emptyMessage:  string;
  emptyAction?:  { label: string; to: string };
  rightPanel?: React.ReactNode;
}

export function DashboardLayout({
  title,
  subtitle,
  statusData,
  isLoading,
  items,
  viewAllLink,
  viewAllLabel,
  emptyMessage,
  emptyAction,
  rightPanel,
}: DashboardLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <DashboardHeader
        title={title}
        subtitle={subtitle}
        primaryAction={emptyAction}
      />

      {/* ── Insights row ────────────────────────────────────────────── */}
      {statusData && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <StatusDistributionSkeleton />
              </div>
            ) : (
              <StatusDistributionCard data={statusData} />
            )}
          </div>

          {/* Right panel (role-specific) */}
<div className="rounded-xl border bg-card p-5 shadow-sm">
  {rightPanel}
</div>
        </div>
      )}

      {/* ── Recent requests table ────────────────────────────────────── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between
                        border-b px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Recent Requests
          </h2>
          <Link
            to={viewAllLink}
            className="text-xs text-muted-foreground hover:text-foreground
                       transition-colors"
          >
            {viewAllLabel} →
          </Link>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-2 py-1">
                <Skeleton className="h-4 w-0.5 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center
                          py-12 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            {emptyAction && (
              <Link
                to={emptyAction.to}
                className="mt-3 text-sm text-primary hover:underline"
              >
                {emptyAction.label}
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {["Title", "Priority", "Status", "Deadline"].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium
                               text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(req => (
                <tr
                  key={req.id}
                  onClick={() => navigate(`/requests/${req.id}`)}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-full w-0.5 rounded-full shrink-0 self-stretch",
                        {
                          "bg-gray-300":   req.priority === "Low",
                          "bg-blue-400":   req.priority === "Normal",
                          "bg-orange-400": req.priority === "High",
                          "bg-red-500":    req.priority === "Urgent",
                        }
                      )} />
                      <span className="font-medium text-foreground
                                       truncate max-w-[200px]">
                        {req.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <PriorityBadge priority={req.priority} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground
                                 whitespace-nowrap">
                    {req.deadline ? formatDate(req.deadline) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}