import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth";
import { PageSpinner } from "@/shared/components/PageSpinner";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  useAdminDashboardStats,
  useCollaboratorDashboardStats,
  useCourierDashboardStats,
} from "../hooks/useDashboardStats";
import { AdminOverduePanel } from "../components/panels/AdminOverduePanel";
import { CollaboratorPendingSurveysPanel } from "../components/panels/CollaboratorPendingSurveysPanel";
import { CourierPerformancePanel } from "../components/panels/CourierPerformancePanel";

function AdminDashboard() {
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

function CollaboratorDashboard() {
  const {  items, isLoading, statusData, pendingSurveys } =
    useCollaboratorDashboardStats();
  return (
    <DashboardLayout
      title="My Dashboard"
      subtitle="Track all your submitted requests."

      statusData={statusData}
      isLoading={isLoading}
      items={items}
      viewAllLink="/requests/mine"
      viewAllLabel="View All My Requests"
      emptyMessage="No requests yet. Create your first one."
      emptyAction={{ label: "Create Request", to: "/requests/new" }}
      rightPanel={
        <CollaboratorPendingSurveysPanel
          isLoading={isLoading}
          count={pendingSurveys.count}
          items={pendingSurveys.items}
        />
      }
    />
  );
}

function CourierDashboard() {
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
          avgRating={performance?.data.avgRating ?? 0}
          completed={performance?.data.completed ?? 0}
          onTimeRate={performance?.data.onTimeRate ?? 0}
        />
      }
    />
  );
}

export function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);

  switch (role) {
    case UserRole.Admin:
      return <AdminDashboard />;
    case UserRole.Collaborator:
      return <CollaboratorDashboard />;
    case UserRole.Courier:
      return <CourierDashboard />;
    default:
      return <PageSpinner />;
  }
}
