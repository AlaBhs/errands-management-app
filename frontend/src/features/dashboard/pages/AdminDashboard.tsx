import { DashboardLayout } from "../components/DashboardLayout";
import { AdminOverduePanel } from "../components/panels/AdminOverduePanel";
import { useAdminDashboardStats } from "../hooks/useAdminDashboardStats";

export function AdminDashboard() {
  const { items, isLoading, statusData, overdue } =
    useAdminDashboardStats();
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of all requests across the system."

      statusData={statusData}
      isLoading={isLoading}
      items={items}
      viewAllLink="/requests"
      viewAllLabel="View All Requests"
      emptyMessage="No requests found."
      rightPanel={
        <AdminOverduePanel
          isLoading={isLoading}
          count={overdue.count}
          items={overdue.items}
        />
      }
    />
  );
}