import { useAnalyticsMyCourierPerformance } from "@/features/analytics/hooks/useAnalytics";
import { useMyAssignments } from "@/features/requests";
import { RequestStatus } from "@/features/requests/types/request.enums";

const last30Days = new Date(Date.now() - 30 * 86_400_000)
  .toISOString()
  .split("T")[0];
const today = new Date().toISOString().split("T")[0];


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