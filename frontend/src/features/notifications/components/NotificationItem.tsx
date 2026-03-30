import { formatDistanceToNow } from "date-fns";
import { NotificationType, type NotificationDto } from "@/features/notifications/types";
import { useNotificationStore } from "@/features/notifications/store/notificationStore";

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

interface NotificationItemProps {
  notification: NotificationDto;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  function handleClick() {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  }

  const dotColor = TYPE_COLOR[notification.type] ?? "bg-gray-400";
  const label    = TYPE_LABEL[notification.type] ?? "Notification";
  const timeAgo  = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer
        ${!notification.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
    >
      {/* Type colour dot */}
      <div className="mt-1 shrink-0">
        <div className={`h-2 w-2 rounded-full mt-1 ${notification.isRead ? "bg-transparent" : dotColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold ${dotColor.replace("bg-", "text-")}`}>
            {label}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          {notification.message}
        </p>
      </div>
    </div>
  );
}