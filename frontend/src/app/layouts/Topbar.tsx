import { Search, Plus, Moon, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth";
import { toast } from "sonner";
import { useTheme } from "@/shared/hooks/useTheme";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

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
  "/notifications": "Notifications",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/requests/") && pathname !== "/requests/new")
    return "Request Details";
  return "EY Errands";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { theme, toggle } = useTheme();

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header
      className="h-16 bg-white dark:bg-card border-b border-border flex
                       items-center justify-between px-6 gap-4"
    >
      {/* ── Left — page title ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="text-gray-400 dark:text-gray-500 hidden md:block">
          EY Errands
        </span>
        <span className="text-gray-300 dark:text-gray-600 hidden md:block">
          /
        </span>
        <span className="font-medium text-[#2E2E38] dark:text-foreground truncate">
          {pageTitle}
        </span>{" "}
      </div>

      {/* ── Right — actions ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search — placeholder for feat/request-filters */}
        <button
          className="flex items-center h-[stretch] gap-2 rounded-lg border
            border-border bg-muted/40 px-3 py-1.5 text-sm
            text-muted-foreground hover:bg-muted transition-colors
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
            className="ml-auto rounded border border-border
              bg-background px-1.5 py-0.5 text-[10px]
              text-muted-foreground font-mono hidden lg:block"
          >
            ⌘K
          </kbd>
        </button>

        {/* Quick action — role-based */}
        {user?.role === UserRole.Collaborator && (
          <button
            onClick={() => navigate("/requests/new")}
            className="flex items-center gap-1.5 rounded-lg h-[stretch]
                        bg-[#2E2E38] px-3 py-1.5 text-xs font-semibold
                        text-white hover:bg-[#1a1a24] transition-colors
                        hidden sm:flex"
          >
            <Plus className="h-3.5 w-3.5" />
            New Request
          </button>
        )}

        {/* Notifications */}
        <NotificationBell />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg
             text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10
             dark:text-gray-400 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-foreground leading-tight">
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
      return "text-purple-600 dark:text-purple-400";
    case "Collaborator":
      return "text-blue-600 dark:text-blue-400";
    case "Courier":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
}
