import { DashboardLayout } from "../components/DashboardLayout";
import { CourierPerformancePanel } from "../components/panels/CourierPerformancePanel";
import { useCourierDashboardStats } from "../hooks/useCourierDashboardStats";

export function CourierDashboard() {
  const { items, isLoading, statusData, performance } = useCourierDashboardStats();

  return (
    <DashboardLayout
      title="My Assignments"
      subtitle="Requests assigned to you."
      statusData={statusData}
      isLoading={isLoading}
      items={items}
      viewAllLink="/assignments"
      viewAllLabel="View All Assignments"
      emptyMessage="No assignments yet."
      rightPanel={
        <CourierPerformancePanel
          isLoading={isLoading}
          avgRating={performance?.avgRating ?? 0}
          completed={performance?.completed ?? 0}
          onTimeRate={performance?.onTimeRate ?? 0}
        />
      }
    />
  );
}