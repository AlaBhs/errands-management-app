import { RequestStatus, useMyRequests } from "@/features/requests";


const last30Days = new Date(Date.now() - 30 * 86_400_000)
  .toISOString()
  .split("T")[0];
const today = new Date().toISOString().split("T")[0];

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