import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { type NotificationDto } from "@/features/notifications/types";
import { useNotificationStore } from "@/features/notifications/store/notificationStore";
import { parseUtc } from "@/shared/utils/date";

const TYPE_COLOR: Record<string, string> = {
  RequestCreated: "bg-blue-500",
  RequestAssigned: "bg-yellow-400",
  RequestStarted: "bg-orange-500",
  RequestCompleted: "bg-green-500",
  RequestCancelled: "bg-gray-600",
  NewMessageReceived: "bg-purple-500",
  DeadlineRisk: "bg-red-500",
  DeliveryHandedToReception: "bg-blue-500",
  DeliveryPickedUp: "bg-green-500",
  General: "bg-gray-400",
};

const TYPE_LABEL: Record<string, string> = {
  RequestCreated: "Request Created",
  RequestAssigned: "Request Assigned",
  RequestStarted: "Request Started",
  RequestCompleted: "Request Completed",
  RequestCancelled: "Request Cancelled",
  NewMessageReceived: "New Message",
  DeadlineRisk: "Deadline Risk",
  DeliveryHandedToReception: "bg-blue-500",
  DeliveryPickedUp: "bg-green-500",
  General: "General",
};

const DELIVERY_TYPES = new Set<string>([
  "DeliveryHandedToReception",
  "DeliveryPickedUp",
]);

function getDestination(notification: NotificationDto): string | null {
  if (!notification.referenceId) return null;

  if (DELIVERY_TYPES.has(notification.type)) {
    return `/delivery/${notification.referenceId}`;
  }

  return `/requests/${notification.referenceId}`;
}

interface NotificationItemProps {
  notification: NotificationDto;
  onNavigate?: () => void;
}

export function NotificationItem({
  notification,
  onNavigate,
}: NotificationItemProps) {
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const navigate = useNavigate();

  function handleClick() {
    if (!notification.isRead) markAsRead(notification.id);

    const destination = getDestination(notification);
    if (destination) {
      onNavigate?.();
      navigate(destination);
    }
  }

  const dotColor = TYPE_COLOR[notification.type] ?? "bg-gray-400";
  const label = TYPE_LABEL[notification.type] ?? "Notification";
  const timeAgo = formatDistanceToNow(parseUtc(notification.createdAt), {
    addSuffix: true,
  });
  const isNavigable = !!getDestination(notification);
  const meta = notification.metadata ? JSON.parse(notification.metadata) : null;

  const deadlineDisplay = meta?.deadlineUtc
    ? parseUtc(meta.deadlineUtc).toLocaleString()
    : null;
  const message = deadlineDisplay
    ? `${notification.message} Deadline: ${deadlineDisplay}`
    : notification.message;
  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 px-4 py-3 transition-colors
        ${isNavigable ? "cursor-pointer" : "cursor-default"}
        ${
          !notification.isRead
            ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/30"
            : "hover:bg-muted/50"
        }`}
    >
      <div className="mt-1 shrink-0">
        <div
          className={`h-2 w-2 rounded-full mt-1 ${notification.isRead ? "bg-transparent" : dotColor}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-xs font-semibold ${dotColor.replace("bg-", "text-")}`}
          >
            {label}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
