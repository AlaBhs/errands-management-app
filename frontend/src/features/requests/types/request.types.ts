// --- Enums ---

export type RequestStatus =
  | "Pending"
  | "Assigned"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type PriorityLevel = "Low" | "Normal" | "High" | "Urgent";

// --- Nested DTOs ---

export interface AddressDto {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  note?: string;
}

export interface AssignmentDto {
  courierId: string;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  actualCost?: number;
  note?: string;
}

export interface AuditLogDto {
  eventType: string;
  detail: string;
  occurredAt: string;
}

export interface SurveyDto {
  rating: number;
  comment?: string;
}

// --- Response DTOs ---

export interface RequestListItemDto {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: PriorityLevel;
  estimatedCost?: number;
  deadline?: string;
}

export interface RequestDetailsDto {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: PriorityLevel;
  deadline?: string;
  estimatedCost?: number;
  requesterId: string;
  deliveryAddress: AddressDto;
  currentAssignment?: AssignmentDto;
  auditLogs: AuditLogDto[];
  survey?: SurveyDto;
}

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