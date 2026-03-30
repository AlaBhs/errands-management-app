import { useEffect } from "react";
import { useNotificationStore } from "@/features/notifications/store/notificationStore";
import { NotificationItem } from "./NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    page,
    totalPages,
    fetchInitial,
    fetchMore,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  return (
    <div className="w-80">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#FFE600]/20 px-2 py-0.5 text-xs font-semibold text-[#2E2E38] dark:text-[#FFE600]">
              {unreadCount} new
            </span>
            <button
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mark all read
            </button>
          </div>
        )}
      </div>

      {/* ── List ───────────────────────────────────────────────────── */}
      <div className="max-h-80 overflow-y-auto divide-y divide-border">
        {isLoading ? (
          <LoadingSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
        )}
      </div>

      {/* ── Load more ──────────────────────────────────────────────── */}
      {!isLoading && page < totalPages && (
        <div className="border-t border-border px-4 py-2.5">
          <button
            onClick={fetchMore}
            disabled={isLoadingMore}
            className="w-full text-center text-xs text-muted-foreground
              hover:text-foreground transition-colors py-1 disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3">
          <Skeleton className="mt-2 h-2 w-2 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm font-medium text-foreground">All caught up</p>
      <p className="mt-1 text-xs text-muted-foreground">No notifications yet.</p>
    </div>
  );
}