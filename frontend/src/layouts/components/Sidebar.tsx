import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle,
  CalendarClock,
  BarChart3,
  Settings 
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/requests", label: "All Requests", icon: FileText },
    { path: "/requests/new", label: "Create Request", icon: PlusCircle },
    { path: "/courier/schedule", label: "Courier Schedule", icon: CalendarClock },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin", label: "Admin", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#2E2E38] text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#3a3a48]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFE600] rounded flex items-center justify-center">
            <span className="font-bold text-[#2E2E38]">EY</span>
          </div>
          <span className="font-semibold text-lg">Errands</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${active 
                      ? "bg-[#FFE600] text-[#2E2E38]" 
                      : "text-gray-300 hover:bg-[#3a3a48] hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#3a3a48]">
        <div className="text-xs text-gray-400">
          <p>© 2026 Ernst & Young</p>
          <p className="mt-1">Errands Management v1.0</p>
        </div>
      </div>
    </aside>
  );
}