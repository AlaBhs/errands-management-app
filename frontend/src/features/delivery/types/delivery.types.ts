import type { AttachmentDto } from '@/features/requests/types/request.types';
import type { DeliveryBatchStatus } from './delivery.enums';

export interface DeliveryBatchListItemDto {
  id:         string;
  title:      string;
  clientName: string;
  status:     DeliveryBatchStatus;
  createdAt:  string;
}

export interface DeliveryBatchDto {
  id:          string;
  title:       string;
  clientName:  string;
  clientPhone: string | null;
  pickupNote:  string | null;
  status:      DeliveryBatchStatus;

  createdBy:  string;
  createdAt:  string;

  handedToReceptionAt: string | null;
  handedToReceptionBy: string | null;

  pickedUpAt:  string | null;
  pickedUpBy:  string | null;
  confirmedBy: string | null;

  cancelledAt:  string | null;
  cancelReason: string | null;

  attachments: AttachmentDto[];
}

export interface DeliveryBatchQueryParams {
  page?:     number;
  pageSize?: number;
  status?:   DeliveryBatchStatus | '';
  search?:   string;
}