import type { PriorityLevel, RequestStatus } from "./request.enums";


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
  courierName: string;
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
  createdAt: string;
  requesterName: string;
  deliveryAddress: AddressDto;
  currentAssignment?: AssignmentDto;
  auditLogs: AuditLogDto[];
  survey?: SurveyDto;
}
