import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '../api/delivery.api';
import { deliveryKeys } from './deliveryKeys';
import type { DeliveryBatchQueryParams } from '../types/delivery.types';

export function useDeliveryBatches(params?: DeliveryBatchQueryParams) {
  return useQuery({
    queryKey: deliveryKeys.list(params),
    queryFn:  () => deliveryApi.getAll(params),
    select:   (res) => res.data,
  });
}

export function useDeliveryBatch(id: string) {
  return useQuery({
    queryKey: deliveryKeys.detail(id),
    queryFn:  () => deliveryApi.getById(id),
    select:   (res) => res.data,
    enabled:  !!id,
  });
}