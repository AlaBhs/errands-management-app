import type { DeliveryBatchQueryParams } from '../types/delivery.types';

export const deliveryKeys = {
  all:    ['delivery-batches'] as const,
  list:   (params?: DeliveryBatchQueryParams) =>
    [...deliveryKeys.all, 'list', params] as const,
  detail: (id: string) =>
    [...deliveryKeys.all, 'detail', id] as const,
};