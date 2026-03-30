import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { BellOff, CheckCheck } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationType } from "@/features/notifications/types";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

// ── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<number, string> = {
  [NotificationType.RequestCreated]:   "bg-blue-500",
  [NotificationType.RequestAssigned]:  "bg-yellow-400",
  [NotificationType.RequestStarted]:   "bg-orange-500",
  [NotificationType.RequestCompleted]: "bg-green-500",
  [NotificationType.RequestCancelled]: "bg-red-500",
  [NotificationType.General]:          "bg-gray-400",
};

const TYPE_LABEL: Record<number, string> = {
  [NotificationType.RequestCreated]:   "Request Created",
  [NotificationType.RequestAssigned]:  "Request Assigned",
  [NotificationType.RequestStarted]:   "Request Started",
  [NotificationType.RequestCompleted]: "Request Completed",
  [NotificationType.RequestCancelled]: "Request Cancelled",
  [NotificationType.General]:          "General",
};

function getDestination(notification: { type: number; referenceId: string | null }): string | null {
  if (notification.referenceId) return `/requests/${notification.referenceId}`;
  return null;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    unreadOnly,
    page,
    totalPages,
    totalCount,
    setUnreadOnly,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  function handleItemClick(notification: Parameters<typeof getDestination>[0] & { id: string; isRead: boolean }) {
    if (!notification.isRead) markAsRead(notification.id);
    const destination = getDestination(notification);
    if (destination) navigate(destination);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <PageHeader title="Notifications" />

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-between gap-4">
        {/* Filter toggle */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors
              ${!unreadOnly
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All
            {totalCount > 0 && (
              <span className="ml-1.5 text-muted-foreground">({totalCount})</span>
            )}
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors
              ${unreadOnly
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[#FFE600] px-1.5 py-0.5 text-[10px] font-bold text-[#2E2E38]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-xs text-muted-foreground
              hover:text-foreground transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* ── List ─────────────────────────────────────────────────────── */}
      <div className="mt-4 rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <PageSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState unreadOnly={unreadOnly} />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => {
              const dotColor  = TYPE_COLOR[n.type] ?? "bg-gray-400";
              const label     = TYPE_LABEL[n.type]  ?? "Notification";
              const timeAgo   = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });
              const navigable = !!getDestination(n);

              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`flex gap-4 px-5 py-4 transition-colors
                    ${navigable ? "cursor-pointer" : "cursor-default"}
                    ${!n.isRead
                      ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/30"
                      : "bg-background hover:bg-muted/40"
                    }`}
                >
                  {/* Colour dot */}
                  <div className="mt-1 shrink-0">
                    <div className={`h-2.5 w-2.5 rounded-full ${n.isRead ? "bg-muted" : dotColor}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-xs font-semibold ${dotColor.replace("bg-", "text-")}`}>
                        {label}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {timeAgo}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm leading-relaxed
                      ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Load more ────────────────────────────────────────────────── */}
      {!isLoading && page < totalPages && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-lg border border-border bg-background px-5 py-2
              text-xs font-medium text-muted-foreground hover:text-foreground
              hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4">
          <Skeleton className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ unreadOnly }: { unreadOnly: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <BellOff className="h-10 w-10 text-muted-foreground/30" />
      <p className="text-sm font-medium text-foreground">
        {unreadOnly ? "No unread notifications" : "All caught up"}
      </p>
      <p className="text-xs text-muted-foreground">
        {unreadOnly
          ? "Switch to \"All\" to see your full history."
          : "New notifications will appear here."}
      </p>
    </div>
  );
}