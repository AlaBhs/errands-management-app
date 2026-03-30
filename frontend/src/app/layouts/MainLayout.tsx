import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageErrorBoundary } from "@/shared/components/PageErrorBoundary";

export function MainLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <PageErrorBoundary>
            <Outlet />
          </PageErrorBoundary>
        </main>
      </div>
    </div>
  );
}