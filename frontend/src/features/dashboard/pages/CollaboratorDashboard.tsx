import { DashboardLayout } from "../components/DashboardLayout";
import { CollaboratorPendingSurveysPanel } from "../components/panels/CollaboratorPendingSurveysPanel";
import { useCollaboratorDashboardStats } from "../hooks/useCollaboratorDashboardStats";

export function CollaboratorDashboard() {
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