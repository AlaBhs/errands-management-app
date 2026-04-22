import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  CalendarClock,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout } from "@/features/auth/hooks/useAuthMutations";
import { UserRole } from "@/features/auth";

// ── Nav config ────────────────────────────────────────────────────────────────

type NavItem = {
  path: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  children?: Omit<NavItem, "icon" | "children">[];
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const adminNav: NavGroup[] = [
  {
    items: [
      {
        path: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { path: "/requests", label: "All Requests", icon: FileText, exact: true },
      { path: "/analytics", label: "Analytics", icon: BarChart3, exact: true },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        path: "/admin",
        label: "Admin Panel",
        icon: Settings,
        exact: true,
        children: [
          { path: "/admin/users", label: "User Management", exact: true },
          { path: "/admin/categories", label: "Categories (soon)" },
          { path: "/admin/settings", label: "Settings (soon)" },
        ],
      },
    ],
  },
];

const collaboratorNav: NavGroup[] = [
  {
    items: [
      {
        path: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        path: "/requests/mine",
        label: "My Requests",
        icon: FileText,
        exact: true,
      },
      {
        path: "/requests/new",
        label: "New Request",
        icon: PlusCircle,
        exact: true,
      },
    ],
  },
];

const courierNav: NavGroup[] = [
  {
    items: [
      {
        path: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        path: "/assignments",
        label: "My Schedule",
        icon: CalendarClock,
        exact: true,
      },
    ],
  },
];

// ── NavItemRow ────────────────────────────────────────────────────────────────

function NavItemRow({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand when any child route is active
  const childActive = hasChildren
    ? item.children!.some((c) =>
        c.exact ? pathname === c.path : pathname.startsWith(c.path),
      )
    : false;

  const [open, setOpen] = useState(childActive);

  const selfActive = item.exact
    ? pathname === item.path
    : pathname.startsWith(item.path);

  const Icon = item.icon;

  // Keep expanded when navigating to a child route
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (childActive) setOpen(true);
  }, [childActive]);

  return (
    <li>
      {/* Main item */}
      <div className="flex items-center gap-1">
        <Link
          to={item.path}
          title={collapsed ? item.label : undefined}
          className={`flex flex-1 items-center gap-3 rounded-lg
                      px-3 py-2.5 transition-colors text-sm
                      ${
                        selfActive && !childActive
                          ? "bg-[var(--ey-yellow)] text-[var(--ey-dark)] font-medium"
                          : childActive
                            ? "text-white"
                            : "text-gray-400 hover:bg-[var(--ey-gray)] hover:text-white"
                      }
                      ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate flex-1">{item.label}</span>}
        </Link>

        {/* Expand toggle — only shown when expanded and has children */}
        {hasChildren && !collapsed && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-7 w-7 items-center justify-center
                       rounded-lg text-gray-500 hover:bg-[var(--ey-gray)]
                       hover:text-white transition-colors"
            aria-label={open ? "Collapse" : "Expand"}
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200
                          ${open ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && open && (
        <ul
          className="mt-0.5 space-y-0.5 ml-4 pl-3
                       border-l border-[var(--ey-gray)]"
        >
          {item.children!.map((child) => {
            const childSelfActive = child.exact
              ? pathname === child.path
              : pathname.startsWith(child.path);

            return (
              <li key={child.path}>
                <Link
                  to={child.path}
                  className={`flex items-center gap-2 rounded-lg
                              px-3 py-2 text-sm transition-colors
                              ${
                                childSelfActive
                                  ? "bg-[var(--ey-yellow)] text-[var(--ey-dark)] font-medium"
                                  : "text-gray-400 hover:bg-[var(--ey-gray)] hover:text-white"
                              }`}
                >
                  <span className="truncate">{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function getNavGroups(role?: UserRole): NavGroup[] {
  switch (role) {
    case UserRole.Admin:
      return adminNav;
    case UserRole.Collaborator:
      return collaboratorNav;
    case UserRole.Courier:
      return courierNav;
    default:
      return [];
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const groups = getNavGroups(user?.role);
  const [collapsed, setCollapsed] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-[var(--ey-aside-bg)] text-white
              transition-all duration-300 ease-in-out
              border-r border-transparent dark:border-white/10
              ${collapsed ? "w-[68px]" : "w-64"}`}
      onMouseEnter={() => collapsed && setIsHoveringLogo(true)}
      onMouseLeave={() => collapsed && setIsHoveringLogo(false)}
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="flex h-16 items-center border-b border-[var(--ey-gray)] px-4">
        {collapsed ? (
          // Collapsed mode: show logo or expand button on hover
          isHoveringLogo ? (
            <button
              onClick={() => setCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg
                         text-gray-400 hover:bg-[var(--ey-gray)] hover:text-white
                         transition-colors mx-auto"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center
                         rounded-lg bg-[var(--ey-yellow)] mx-auto"
            >
              <span className="text-sm font-black text-[var(--ey-dark)]">EY</span>
            </div>
          )
        ) : (
          // Expanded mode: full logo + collapse button
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center
                           rounded-lg bg-[var(--ey-yellow)]"
              >
                <span className="text-sm font-black text-[var(--ey-dark)]">EY</span>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">EY Errands</p>
                <p
                  className="text-[10px] font-medium tracking-widest
                             text-[var(--ey-yellow)]/60 uppercase"
                >
                  Management
                </p>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg
                         text-gray-400 hover:bg-[var(--ey-gray)] hover:text-white
                         transition-colors"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <p
                className="mb-1.5 px-3 text-[10px] font-semibold
                      uppercase tracking-widest text-gray-500"
              >
                {group.label}
              </p>
            )}
            {group.label && collapsed && (
              <div className="mb-1.5 mx-3 h-px bg-[var(--ey-gray)]" />
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <NavItemRow
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  pathname={location.pathname}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── footer ───────────────────────────────────────────────── */}
      <div className="border-t border-[var(--ey-gray)] p-3">
        <button
          onClick={() => logout.mutate()}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                text-gray-400 hover:bg-[var(--ey-gray)] hover:text-red-400
                transition-colors
                ${collapsed ? "justify-center px-2" : ""}`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
