import { Clock, Package, XCircle } from "lucide-react";
import { ReceptionRecentPickupsPanel } from "../components/panels/ReceptionRecentPickupsPanel";
import { ReceptionWaitingPanel } from "../components/panels/ReceptionWaitingPanel";
import { useReceptionDashboardStats } from "../hooks/useReceptionDashboardStats";

export function ReceptionDashboard() {
  const { isLoading, stats, waitingItems, recentPickups } =
    useReceptionDashboardStats();

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track incoming deliveries and manage client pickups.
        </p>
      </div>

      {/* ── Stat counters ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Waiting at reception */}
        <div className="rounded-xl border bg-card p-5 shadow-sm
                        flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase
                             tracking-wider">
              Waiting
            </span>
            <div className="flex h-8 w-8 items-center justify-center
                            rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-3xl font-bold text-foreground">
              {stats.waitingCount}
            </p>
          )}
          <p className="text-xs text-muted-foreground">At reception desk</p>
        </div>

        {/* Total picked up */}
        <div className="rounded-xl border bg-card p-5 shadow-sm
                        flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase
                             tracking-wider">
              Picked Up
            </span>
            <div className="flex h-8 w-8 items-center justify-center
                            rounded-lg bg-green-100 dark:bg-green-900/30">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-3xl font-bold text-foreground">
              {stats.pickedUpTotal}
            </p>
          )}
          <p className="text-xs text-muted-foreground">All time</p>
        </div>

        {/* Cancelled */}
        <div className="rounded-xl border bg-card p-5 shadow-sm
                        flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase
                             tracking-wider">
              Cancelled
            </span>
            <div className="flex h-8 w-8 items-center justify-center
                            rounded-lg bg-gray-100 dark:bg-gray-800">
              <XCircle className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-3xl font-bold text-foreground">
              {stats.cancelledTotal}
            </p>
          )}
          <p className="text-xs text-muted-foreground">All time</p>
        </div>
      </div>

      {/* ── Main panels ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Waiting panel — takes 2 cols */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <ReceptionWaitingPanel
            isLoading={isLoading}
            items={waitingItems}
            count={stats.waitingCount}
          />
        </div>

        {/* Recent pickups — 1 col */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <ReceptionRecentPickupsPanel
            isLoading={isLoading}
            items={recentPickups}
          />
        </div>
      </div>
    </div>
  );
}