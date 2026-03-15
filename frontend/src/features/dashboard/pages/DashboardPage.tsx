import { useAuthStore } from '@/features/auth/store/authStore';
import { UserRole } from '@/features/auth';
import { PageSpinner } from '@/shared/components/PageSpinner';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  useAdminDashboardStats,
  useCollaboratorDashboardStats,
  useCourierDashboardStats,
} from '../hooks/useDashboardStats';

function AdminDashboard() {
  const { stats, items, isLoading } = useAdminDashboardStats();
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of all requests across the system."
      stats={stats}
      isLoading={isLoading}
      items={items}
      viewAllLink="/requests"
      viewAllLabel="View All Requests"
      emptyMessage="No requests found."
    />
  );
}

function CollaboratorDashboard() {
  const { stats, items, isLoading } = useCollaboratorDashboardStats();
  return (
    <DashboardLayout
      title="My Dashboard"
      subtitle="Track all your submitted requests."
      stats={stats}
      isLoading={isLoading}
      items={items}
      viewAllLink="/requests/mine"
      viewAllLabel="View All My Requests"
      emptyMessage="No requests yet. Create your first one."
      emptyAction={{ label: 'Create Request', to: '/requests/new' }}
    />
  );
}

function CourierDashboard() {
  const { stats, items, isLoading } = useCourierDashboardStats();
  return (
    <DashboardLayout
      title="My Assignments"
      subtitle="Requests assigned to you."
      stats={stats}
      isLoading={isLoading}
      items={items}
      viewAllLink="/assignments"
      viewAllLabel="View All Assignments"
      emptyMessage="No assignments yet."
    />
  );
}

export function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);

  switch (role) {
    case UserRole.Admin:        return <AdminDashboard />;
    case UserRole.Collaborator: return <CollaboratorDashboard />;
    case UserRole.Courier:      return <CourierDashboard />;
    default:                    return <PageSpinner />;
  }
}