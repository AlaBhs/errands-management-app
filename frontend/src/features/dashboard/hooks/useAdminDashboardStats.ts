import { useRequests } from "@/features/requests";
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