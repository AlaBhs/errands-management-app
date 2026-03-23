import { X, CheckCircle, AlertCircle, Info, UserCheck } from "lucide-react";

interface Notification {
  id: number;
  type: "assignment" | "request" | "completion" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const notifications: Notification[] = [
    {
      id: 1,
      type: "assignment",
      title: "New Assignment",
      message: "You have been assigned to REQ-002: IT Equipment Request",
      time: "5 minutes ago",
      read: false,
    },
    // ... (rest of the dummy notifications)
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <UserCheck className="w-5 h-5 text-blue-600" />;
      case "request":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "completion":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E38]">Notifications</h2>
            <p className="text-xs text-gray-500">
              {notifications.filter(n => !n.read).length} unread
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <CheckCircle className="w-12 h-12 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  {/* notification content */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-[#2E2E38]">{notification.title}</p>
                        {!notification.read && <span className="w-2 h-2 bg-[#FFE600] rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button className="w-full px-4 py-2 text-sm text-[#2E2E38] hover:bg-gray-100 rounded-lg">
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}