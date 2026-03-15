import type { PaginationParams } from "@/shared/api/types";
import type { AddressDto } from "./request.types";
import type { RequestStatus } from "./request.enums";


// --- Command Payloads ---

export interface CreateRequestPayload {
  title: string;
  description: string;
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

export type SortField = "createdat" | "deadline" | "estimatedcost";

export interface RequestQueryParams extends PaginationParams {
  sortBy?: SortField;
  status?: RequestStatus;
  search?: string;
  descending?: boolean;
}