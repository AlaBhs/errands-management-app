import type { DeliveryBatchStatus } from '../types/delivery.enums';

const statusStyles: Record<DeliveryBatchStatus, string> = {
  Created:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  HandedToReception:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  PickedUp:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Cancelled:
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const statusLabels: Record<DeliveryBatchStatus, string> = {
  Created:           'Created',
  HandedToReception: 'At Reception',
  PickedUp:          'Picked Up',
  Cancelled:         'Cancelled',
};

interface DeliveryStatusBadgeProps {
  status: DeliveryBatchStatus;
}

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5
                  text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}