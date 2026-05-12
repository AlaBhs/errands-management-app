import { useDeliveryBatches } from '@/features/delivery/hooks';
import { DeliveryBatchStatus } from '@/features/delivery/types/delivery.enums';

const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
  const now = Date.now();
  const MS_48H = 48 * 60 * 60 * 1000;

export function useReceptionDashboardStats() {
  const { data: waiting, isLoading: l1 } = useDeliveryBatches({
    status:   DeliveryBatchStatus.HandedToReception,
    pageSize: 50,
    page:     1,
  });

  // Recent pickups — last 10
  const { data: recentPickups, isLoading: l2 } = useDeliveryBatches({
    status:   DeliveryBatchStatus.PickedUp,
    pageSize: 5,
    page:     1,
  });

  // Total picked up
  const { data: pickedUpTotal, isLoading: l3 } = useDeliveryBatches({
    status:   DeliveryBatchStatus.PickedUp,
    pageSize: 1,
    page:     1,
  });

  // Cancelled total
  const { data: cancelledTotal, isLoading: l4 } = useDeliveryBatches({
    status:   DeliveryBatchStatus.Cancelled,
    pageSize: 1,
    page:     1,
  });



  const waitingItems = (waiting?.items ?? []).map((b) => ({
    id:          b.id,
    title:       b.title,
    clientName:  b.clientName,
    createdAt:   b.createdAt,
    isOverdue:   now - new Date(b.createdAt).getTime() > MS_48H,
  }));

  waitingItems.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return {
    isLoading: l1 || l2 || l3 || l4,
    stats: {
      waitingCount:   waiting?.totalCount    ?? 0,
      pickedUpTotal:  pickedUpTotal?.totalCount ?? 0,
      cancelledTotal: cancelledTotal?.totalCount ?? 0,
    },
    waitingItems,
    recentPickups: recentPickups?.items ?? [],
  };
}