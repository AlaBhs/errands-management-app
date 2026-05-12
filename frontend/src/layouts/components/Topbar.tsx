import { Bell, User } from "lucide-react";
import { useState } from "react";
import { NotificationPanel } from "./NotificationPanel.tsx";

export function Topbar() {
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl text-[#2E2E38]">Errands Management System</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => setNotificationOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFE600] rounded-full border border-white"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium text-[#2E2E38]">John Smith</p>
              <p className="text-xs text-gray-500">Senior Manager</p>
            </div>
            <div className="w-10 h-10 bg-[#2E2E38] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      <NotificationPanel isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </>
  );
}