import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deliveryApi } from '../api/delivery.api';
import { deliveryKeys } from './deliveryKeys';
import { isApiError } from '@/shared/api/client';
import type {
  CancelDeliveryBatchPayload,
  ConfirmPickupPayload,
  CreateDeliveryBatchPayload,
} from '../types/delivery.payloads';

export function useCreateDeliveryBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDeliveryBatchPayload) =>
      deliveryApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
      toast.success('Delivery batch created.');
    },
    onError: (err) => {
      toast.error(
        isApiError(err) ? err.message : 'Failed to create delivery batch.',
      );
    },
  });
}

export function useHandoverDelivery(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deliveryApi.handover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
      toast.success('Batch handed to reception.');
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : 'Failed to hand over batch.');
    },
  });
}

export function useConfirmPickup(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfirmPickupPayload) =>
      deliveryApi.confirmPickup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
      toast.success('Pickup confirmed.');
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : 'Failed to confirm pickup.');
    },
  });
}

export function useCancelDelivery(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CancelDeliveryBatchPayload) =>
      deliveryApi.cancel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
      toast.success('Delivery batch cancelled.');
    },
    onError: (err) => {
      toast.error(
        isApiError(err) ? err.message : 'Failed to cancel delivery batch.',
      );
    },
  });
}

export function useUploadPickupProof(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => deliveryApi.uploadPickupProof(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
      toast.success('Pickup proof uploaded.');
    },
    onError: () => {
      toast.error('Failed to upload pickup proof. Please try again.');
    },
  });
}