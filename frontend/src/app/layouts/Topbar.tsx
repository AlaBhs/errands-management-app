import { Bell, Search, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// ── Page title map ────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/requests": "All Requests",
  "/requests/mine": "My Requests",
  "/requests/new": "New Request",
  "/assignments": "My Assignments",
  "/analytics": "Analytics",
  "/admin": "Admin Panel",
  "/admin/users": "User Management",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Request details
  if (pathname.startsWith("/requests/") && pathname !== "/requests/new")
    return "Request Details";
  return "EY Errands";
}

// ── Dummy notifications — replaced by real data in feat/notifications ─────────

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    type: "assignment" as const,
    title: "New Assignment",
    message: "REQ-002: IT Equipment Request has been assigned to you",
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    type: "completion" as const,
    title: "Request Completed",
    message: "REQ-001: Office Supplies has been delivered",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "info" as const,
    title: "Survey Reminder",
    message: "Please rate your experience with REQ-003",
    time: "2 hours ago",
    read: true,
  },
];

const notifIconColor = {
  assignment: "text-blue-500",
  completion: "text-emerald-500",
  request: "text-orange-500",
  info: "text-gray-400",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const pageTitle = getPageTitle(location.pathname);
  const unreadCount = DUMMY_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header
      className="h-16 bg-white border-b border-border flex
                       items-center justify-between px-6 gap-4"
    >
      {/* ── Left — page title ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="text-gray-400 hidden md:block">EY Errands</span>
        <span className="text-gray-300 hidden md:block">/</span>
        <span className="font-medium text-[#2E2E38] truncate">{pageTitle}</span>
      </div>

      {/* ── Right — actions ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search — placeholder for feat/request-filters */}
        <button
          className="flex items-center gap-2 rounded-lg border
                     border-gray-200 bg-gray-50 px-3 py-1.5 text-sm
                     text-gray-400 hover:bg-gray-100 transition-colors
                     w-48 hidden md:flex"
          onClick={() =>
            toast.info(
              "Global search coming soon — use filters on each page for now.",
            )
          }
          aria-label="Search"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="text-xs">Search requests...</span>
          <kbd
            className="ml-auto rounded border border-gray-200
                          bg-white px-1.5 py-0.5 text-[10px]
                          text-gray-400 font-mono hidden lg:block"
          >
            ⌘K
          </kbd>
        </button>

        {/* Quick action — role-based */}
        {user?.role === UserRole.Collaborator && (
          <button
            onClick={() => navigate("/requests/new")}
            className="flex items-center gap-1.5 rounded-lg
                       bg-[#2E2E38] px-3 py-1.5 text-xs font-semibold
                       text-white hover:bg-[#1a1a24] transition-colors
                       hidden sm:flex"
          >
            <Plus className="h-3.5 w-3.5" />
            New Request
          </button>
        )}

        {/* Notifications dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-9 w-9 items-center justify-center
                         rounded-lg text-gray-500 hover:bg-gray-100
                         transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute right-1.5 top-1.5 flex h-4 w-4
                                 items-center justify-center rounded-full
                                 bg-[#FFE600] text-[9px] font-bold
                                 text-[#2E2E38]"
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between
                            border-b border-gray-100 px-4 py-3"
            >
              <p className="text-sm font-semibold text-[#2E2E38]">
                Notifications
              </p>
              {unreadCount > 0 && (
                <span
                  className="rounded-full bg-[#FFE600]/20 px-2 py-0.5
                                 text-xs font-semibold text-[#2E2E38]"
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* List */}
            <div
              className="max-h-80 overflow-y-auto divide-y
                            divide-gray-50"
            >
              {DUMMY_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-gray-50
                              transition-colors cursor-pointer
                              ${!n.read ? "bg-blue-50/50" : ""}`}
                >
                  {/* Unread dot */}
                  <div className="mt-1 shrink-0">
                    <div
                      className={`h-2 w-2 rounded-full mt-1
                                    ${
                                      !n.read
                                        ? "bg-[#FFE600]"
                                        : "bg-transparent"
                                    }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-xs font-semibold
                                    ${notifIconColor[n.type]}`}
                      >
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-gray-400">
                        {n.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button
                className="w-full text-center text-xs text-gray-400
                                 hover:text-[#2E2E38] transition-colors
                                 py-1"
              >
                Mark all as read
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* User info — display only, no dropdown needed */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-[#2E2E38] leading-tight">
              {user?.fullName ?? "—"}
            </p>
            <span
              className={`text-[10px] font-medium
                             ${roleBadgeClass(user?.role)}`}
            >
              {user?.role ?? "—"}
            </span>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center
                          rounded-full bg-[#2E2E38] text-xs font-bold
                          text-[#FFE600]"
          >
            {getInitials(user?.fullName)}
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function roleBadgeClass(role?: string): string {
  switch (role) {
    case "Admin":
      return "text-purple-600";
    case "Collaborator":
      return "text-blue-600";
    case "Courier":
      return "text-amber-600";
    default:
      return "text-gray-500";
  }
}
