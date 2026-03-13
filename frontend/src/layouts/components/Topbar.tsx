import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NotificationPanel } from './NotificationPanel.tsx';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout } from '@/features/auth';

export function Topbar() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFE600] rounded-full border border-white" />
          </button>

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-[#2E2E38]">
                  {user?.fullName ?? '—'}
                </p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(user?.role)}`}>
                  {user?.role ?? '—'}
                </span>
              </div>
              <div className="w-10 h-10 bg-[#2E2E38] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${roleBadgeClass(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout.mutate();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationPanel isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </>
  );
}

function roleBadgeClass(role?: string): string {
  switch (role) {
    case 'Admin':        return 'bg-purple-100 text-purple-700';
    case 'Collaborator': return 'bg-blue-100 text-blue-700';
    case 'Courier':      return 'bg-yellow-100 text-yellow-700';
    default:             return 'bg-gray-100 text-gray-600';
  }
}