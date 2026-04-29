import type { PaginationParams } from "@/shared/api/types";
import type { AddressDto } from "./request.types";
import type { ExpenseCategory, RequestCategory, RequestStatus } from "./request.enums";

// --- Command Payloads ---

export interface CreateRequestPayload {
  title: string;
  description: string;
  deliveryAddress: AddressDto;
  priority: number;
  category: RequestCategory;
  contactPerson?: string;
  contactPhone?: string;
  comment?: string;
  deadline?: string;
  estimatedCost?: number;
}

export interface SetAdvancedAmountPayload {
  amount: number;
}

export interface AddExpenseRecordPayload {
  category: ExpenseCategory;
  amount: number;
  description?: string;
}
// --- Lifecycle Command Payloads ---

export interface AssignRequestPayload {
  courierId: string;
}

export interface CancelRequestPayload {
  reason: string;
}

export interface CompleteRequestPayload {
  note?: string;
  dischargePhoto?: File;
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
  isOverdue?: boolean;
  hasSurvey?: boolean;
  category?: RequestCategory;
  from?: string;
  to?:   string;
}
