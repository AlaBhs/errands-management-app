export const DeliveryBatchStatus = {
  Created:           'Created',
  HandedToReception: 'HandedToReception',
  PickedUp:          'PickedUp',
  Cancelled:         'Cancelled',
} as const;

export type DeliveryBatchStatus =
  typeof DeliveryBatchStatus[keyof typeof DeliveryBatchStatus];