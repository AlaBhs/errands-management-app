import type { AddressDto } from "./request.types";


// --- Command Payloads ---

export interface CreateRequestPayload {
  title: string;
  description: string;
  requesterId: string;
  deliveryAddress: AddressDto;
  priority: number;
  deadline?: string;
  estimatedCost?: number;
}
// --- Lifecycle Command Payloads ---

export interface AssignRequestPayload {
  courierId: string;
}

export interface CancelRequestPayload {
  reason: string;
}

export interface CompleteRequestPayload {
  actualCost?: number;
  note?: string;
}

export interface SubmitSurveyPayload {
  rating: number;
  comment?: string;
}