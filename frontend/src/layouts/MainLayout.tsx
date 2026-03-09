import { Outlet, Link, NavLink } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-gray-900">
            Errands Management
          </Link>
          <div className="flex gap-6 text-sm">
            <NavLink
              to="/requests"
              className={({ isActive }) =>
                isActive ? "font-medium text-primary" : "text-gray-500 hover:text-gray-900"
              }
            >
              Requests
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}