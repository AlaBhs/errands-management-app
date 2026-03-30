import { Bell } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signalr } from "@/shared/api/signalr";
import { useNotificationStore } from "@/features/notifications/store/notificationStore";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const { unreadCount, appendRealtime, fetchUnreadCount } = useNotificationStore();

  // Fetch fresh unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Subscribe to real-time notifications from SignalR
  useEffect(() => {
    const unsub = signalr.onNotification((notification) => {
      appendRealtime(notification);
      toast.info(notification.message, { duration: 5000 });
    });
    return unsub;
  }, [appendRealtime]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center
            rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute right-1.5 top-1.5 flex h-4 w-4
                items-center justify-center rounded-full
                bg-[#FFE600] text-[9px] font-bold text-[#2E2E38]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="p-0 overflow-hidden">
        <NotificationDropdown />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}