import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BellOff, ArrowRight } from "lucide-react";
import { useNotificationStore } from "@/features/notifications/store/notificationStore";
import { NotificationItem } from "./NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchInitial,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  function handleViewAll() {
    onClose();
    navigate("/notifications");
  }

  return (
    <div className="flex flex-col w-full">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#FFE600] px-2 py-0.5 text-[10px] font-bold text-[#2E2E38]">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* ── List ───────────────────────────────────────────────────── */}
      <div className="divide-y divide-border">
        {isLoading ? (
          <LoadingSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onNavigate={onClose}
            />
          ))
        )}
      </div>

      {/* ── Footer — View all ──────────────────────────────────────── */}
      <div className="border-t border-border bg-muted/20">
        <button
          onClick={handleViewAll}
          className="flex w-full items-center justify-center gap-1.5 py-3
            text-xs font-medium text-muted-foreground hover:text-foreground
            transition-colors group"
        >
          View all notifications
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
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
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <BellOff className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">All caught up</p>
      <p className="text-xs text-muted-foreground">No notifications yet.</p>
    </div>
  );
}