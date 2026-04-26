import { apiClient } from '@/shared/api/client';
import type { ApiResponse, PaginatedResponse } from '@/shared/api/types';
import type { AttachmentDto } from '@/features/requests/types/request.types';
import type {
  DeliveryBatchDto,
  DeliveryBatchListItemDto,
  DeliveryBatchQueryParams,
} from '../types/delivery.types';
import type {
  CancelDeliveryBatchPayload,
  ConfirmPickupPayload,
  CreateDeliveryBatchPayload,
} from '../types/delivery.payloads';

export const deliveryApi = {
  // ── Queries ─────────────────────────────────────────────────────────────
  getAll: (params?: DeliveryBatchQueryParams) =>
    apiClient
      .get<PaginatedResponse<DeliveryBatchListItemDto>>('/delivery-batches', {
        params,
      })
      .then((res) => res.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<DeliveryBatchDto>>(`/delivery-batches/${id}`)
      .then((res) => res.data),

  // ── Admin commands ───────────────────────────────────────────────────────
  create: (payload: CreateDeliveryBatchPayload) =>
    apiClient
      .post<ApiResponse<string>>('/delivery-batches', payload)
      .then((res) => res.data),

  handover: (id: string) =>
    apiClient
      .post<ApiResponse<string>>(`/delivery-batches/${id}/handover`, {})
      .then((res) => res.data),

  // ── Reception commands ───────────────────────────────────────────────────
  confirmPickup: (id: string, payload: ConfirmPickupPayload) =>
    apiClient
      .post<ApiResponse<string>>(`/delivery-batches/${id}/confirm-pickup`, payload)
      .then((res) => res.data),

  cancel: (id: string, payload: CancelDeliveryBatchPayload) =>
    apiClient
      .post<ApiResponse<string>>(`/delivery-batches/${id}/cancel`, payload)
      .then((res) => res.data),

  // ── Pickup proof attachment ──────────────────────────────────────────────
  uploadPickupProof: async (id: string, file: File): Promise<AttachmentDto> => {
    const form = new FormData();
    form.append('file', file);

    const { data } = await apiClient.post<{ data: AttachmentDto }>(
      `/delivery-batches/${id}/attachments/pickup-proof`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },
};