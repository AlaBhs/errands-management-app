import { useRequests, useMyRequests, useMyAssignments } from '@/features/requests';
import { RequestStatus } from '@/features/requests/types/request.enums';
import {
  FileText, Clock, CheckCircle, TruckIcon,
  AlertTriangle, ClipboardList,
} from 'lucide-react';

export function useAdminDashboardStats() {
  const { data: all }        = useRequests({ page: 1, pageSize: 1 });
  const { data: pending }    = useRequests({ page: 1, pageSize: 1, status: RequestStatus.Pending });
  const { data: inProgress } = useRequests({ page: 1, pageSize: 1, status: RequestStatus.InProgress });
  const { data: completed }  = useRequests({ page: 1, pageSize: 1, status: RequestStatus.Completed });
  const { data: recent, isLoading } = useRequests({ page: 1, pageSize: 5 });

  return {
    isLoading,
    items: recent?.items ?? [],
    stats: [
      { title: 'Total Requests', value: all?.totalCount        ?? '—', icon: FileText,    bg: 'bg-blue-50',   color: 'text-blue-600' },
      { title: 'Pending',        value: pending?.totalCount    ?? '—', icon: Clock,       bg: 'bg-orange-50', color: 'text-orange-600' },
      { title: 'In Progress',    value: inProgress?.totalCount ?? '—', icon: TruckIcon,   bg: 'bg-purple-50', color: 'text-purple-600' },
      { title: 'Completed',      value: completed?.totalCount  ?? '—', icon: CheckCircle, bg: 'bg-green-50',  color: 'text-green-600' },
    ],
  };
}

export function useCollaboratorDashboardStats() {
  const { data: all }       = useMyRequests({ page: 1, pageSize: 1 });
  const { data: pending }   = useMyRequests({ page: 1, pageSize: 1, status: RequestStatus.Pending });
  const { data: completed } = useMyRequests({ page: 1, pageSize: 1, status: RequestStatus.Completed });
  const { data: cancelled } = useMyRequests({ page: 1, pageSize: 1, status: RequestStatus.Cancelled });
  const { data: recent, isLoading } = useMyRequests({ page: 1, pageSize: 5 });

  return {
    isLoading,
    items: recent?.items ?? [],
    stats: [
      { title: 'My Requests', value: all?.totalCount       ?? '—', icon: FileText,      bg: 'bg-blue-50',   color: 'text-blue-600' },
      { title: 'Pending',     value: pending?.totalCount   ?? '—', icon: Clock,         bg: 'bg-orange-50', color: 'text-orange-600' },
      { title: 'Completed',   value: completed?.totalCount ?? '—', icon: CheckCircle,   bg: 'bg-green-50',  color: 'text-green-600' },
      { title: 'Cancelled',   value: cancelled?.totalCount ?? '—', icon: AlertTriangle, bg: 'bg-red-50',    color: 'text-red-600' },
    ],
  };
}

export function useCourierDashboardStats() {
  const { data: all }        = useMyAssignments({ page: 1, pageSize: 1 });
  const { data: assigned }   = useMyAssignments({ page: 1, pageSize: 1, status: RequestStatus.Assigned });
  const { data: inProgress } = useMyAssignments({ page: 1, pageSize: 1, status: RequestStatus.InProgress });
  const { data: completed }  = useMyAssignments({ page: 1, pageSize: 1, status: RequestStatus.Completed });
  const { data: recent, isLoading } = useMyAssignments({ page: 1, pageSize: 5 });

  return {
    isLoading,
    items: recent?.items ?? [],
    stats: [
      { title: 'Total Assigned', value: all?.totalCount        ?? '—', icon: ClipboardList, bg: 'bg-blue-50',   color: 'text-blue-600' },
      { title: 'Awaiting Start', value: assigned?.totalCount   ?? '—', icon: Clock,         bg: 'bg-orange-50', color: 'text-orange-600' },
      { title: 'In Progress',    value: inProgress?.totalCount ?? '—', icon: TruckIcon,     bg: 'bg-purple-50', color: 'text-purple-600' },
      { title: 'Completed',      value: completed?.totalCount  ?? '—', icon: CheckCircle,   bg: 'bg-green-50',  color: 'text-green-600' },
    ],
  };
}