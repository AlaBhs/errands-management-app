import { useAnalyticsMyCourierPerformance } from "@/features/analytics/hooks/useAnalytics";
import {
  useRequests,
  useMyRequests,
  useMyAssignments,
} from "@/features/requests";
import { RequestStatus } from "@/features/requests/types/request.enums";

const last30Days = new Date(Date.now() - 30 * 86_400_000)
  .toISOString()
  .split("T")[0];
const today = new Date().toISOString().split("T")[0];
const now = Date.now();

export function useAdminDashboardStats() {
  const { data: pending, isLoading: l2 } = useRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Pending,
    from: last30Days,
    to: today,
  });
  const { data: assigned, isLoading: l3 } = useRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Assigned,
    from: last30Days,
    to: today,
  });
  const { data: inProgress, isLoading: l4 } = useRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.InProgress,
    from: last30Days,
    to: today,
  });
  const { data: completed, isLoading: l5 } = useRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Completed,
    from: last30Days,
    to: today,
  });
  const { data: cancelled, isLoading: l6 } = useRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Cancelled,
    from: last30Days,
    to: today,
  });
  const { data: recent, isLoading: l7 } = useRequests({
    page: 1,
    pageSize: 5,
    sortBy: "createdat",
    descending: true,
    from: last30Days,
    to: today,
  });
  const { data: overdueData, isLoading: l1 } = useRequests({
    page: 1,
    pageSize: 8,
    isOverdue: true,
  });

  return {
    isLoading: l1 || l2 || l3 || l4 || l5 || l6 || l7,
    items: recent?.items ?? [],
    overdue: {
      count: overdueData?.totalCount ?? 0,
      items: (overdueData?.items ?? []).map((r) => {
        const daysLate = r.deadline
          ? Math.floor((now - new Date(r.deadline).getTime()) / 86_400_000)
          : 0;

        return {
          id: r.id,
          title: r.title,
          daysLate,
        };
      }),
    },
    statusData: {
      Pending: pending?.totalCount ?? 0,
      Assigned: assigned?.totalCount ?? 0,
      InProgress: inProgress?.totalCount ?? 0,
      Completed: completed?.totalCount ?? 0,
      Cancelled: cancelled?.totalCount ?? 0,
    },
  };
}

export function useCollaboratorDashboardStats() {
  const { data: pending, isLoading: l2 } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Pending,
    from: last30Days,
    to: today,
  });
  const { data: inProgress, isLoading: l3 } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.InProgress,
    from: last30Days,
    to: today,
  });
  const { data: completed, isLoading: l4 } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Completed,
    from: last30Days,
    to: today,
  });
  const { data: cancelled, isLoading: l5 } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Cancelled,
    from: last30Days,
    to: today,
  });
  const { data: recent, isLoading: l6 } = useMyRequests({
    page: 1,
    pageSize: 5,
    sortBy: "createdat",
    descending: true,
    from: last30Days,
    to: today,
  });
  const { data: pendingSurveysData, isLoading: l1 } = useMyRequests({
    page: 1,
    pageSize: 5,
    status: RequestStatus.Completed,
    hasSurvey: false,
  });

  return {
    isLoading: l1 || l2 || l3 || l4 || l5 || l6,
    items: recent?.items ?? [],
    pendingSurveys: {
      count: pendingSurveysData?.totalCount ?? 0,
      items: (pendingSurveysData?.items ?? []).map((r) => ({
        id: r.id,
        title: r.title,
      })),
    },
    statusData: {
      Pending: pending?.totalCount ?? 0,
      InProgress: inProgress?.totalCount ?? 0,
      Completed: completed?.totalCount ?? 0,
      Cancelled: cancelled?.totalCount ?? 0,
    },
  };
}

export function useCourierDashboardStats() {
  const { data: assigned, isLoading: l2 } = useMyAssignments({
    page: 1,
    pageSize: 1,
    from: last30Days,
    to: today,
    status: RequestStatus.Assigned,
  });
  const { data: inProgress, isLoading: l3 } = useMyAssignments({
    page: 1,
    pageSize: 1,
    from: last30Days,
    to: today,
    status: RequestStatus.InProgress,
  });
  const { data: completed, isLoading: l4 } = useMyAssignments({
    page: 1,
    pageSize: 1,
    from: last30Days,
    to: today,
    status: RequestStatus.Completed,
  });
  const { data: recent, isLoading: l5 } = useMyAssignments({
    page: 1,
    pageSize: 5,
    sortBy: "createdat",
    descending: true,
  });
  const { data: performance, isLoading: l1 } =
    useAnalyticsMyCourierPerformance(30);

  return {
    isLoading: l1 || l2 || l3 || l4 || l5,
    items: recent?.items ?? [],

    statusData: {
      Assigned: assigned?.totalCount ?? 0,
      InProgress: inProgress?.totalCount ?? 0,
      Completed: completed?.totalCount ?? 0,
    },
    performance,
  };
}
