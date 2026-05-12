import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth";
import { PageSpinner } from "@/shared/components/PageSpinner";
import { AdminDashboard } from "./AdminDashboard";
import { CollaboratorDashboard } from "./CollaboratorDashboard";
import { CourierDashboard } from "./CourierDashboard";
import { ReceptionDashboard } from "./ReceptionDashboard";


export function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);

  switch (role) {
    case UserRole.Admin:
      return <AdminDashboard />;
    case UserRole.Collaborator:
      return <CollaboratorDashboard />;
    case UserRole.Courier:
      return <CourierDashboard />;
    case UserRole.Reception:
      return <ReceptionDashboard />;
    default:
      return <PageSpinner />;
  }
}
