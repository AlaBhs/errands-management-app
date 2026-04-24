import type { AttachmentType, ExpenseCategory, PriorityLevel, RequestCategory, RequestStatus } from "./request.enums";


// --- Nested DTOs ---

export interface AddressDto {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  note?: string;
  latitude?: number;
  longitude?: number;
}

export interface AssignmentDto {
  courierId: string;
  courierName: string;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  actualCost?: number;
  note?: string;
  advancedAmount?: number; 
  isReconciled: boolean;
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

export interface ExpenseRecordDto {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  createdBy: string;
  createdAt: string;
}

export interface ExpenseSummaryDto {
  advancedAmount?: number;       
  totalExpenses: number;
  difference?: number;           
  isReconciled: boolean;
  reconciledAt?: string;
}
// --- Response DTOs ---

export interface RequestListItemDto {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: PriorityLevel;
  category: RequestCategory;
  estimatedCost?: number;
  deadline?: string;
  hasSurvey?: boolean;
}

export interface RequestDetailsDto {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: PriorityLevel;
  category: RequestCategory;
  contactPerson?: string;
  contactPhone?: string;
  comment?: string;
  deadline?: string;
  estimatedCost?: number;
  requesterId: string;
  createdAt: string;
  requesterName: string;
  deliveryAddress: AddressDto;
  currentAssignment?: AssignmentDto;
  auditLogs: AuditLogDto[];
  attachments: AttachmentDto[];
  survey?: SurveyDto;
  expenseSummary?: ExpenseSummaryDto;
}

export interface AttachmentDto {
  id:          string;
  fileName:    string;
  contentType: string;
  uri:         string;
  type:        AttachmentType;
  uploadedAt:  string;
}

export interface ScoreBreakdownDto {
  availabilityScore: number;
  proximityScore: number;
  performanceScore: number;
}

export interface CourierScoreDto {
  courierId: string;
  fullName: string;
  email: string;
  city?: string;
  activeAssignmentsCount: number;
  averageRating: number;
  completionRate: number;
  distanceKm?: number;
  totalScore: number;
  scoreBreakdown: ScoreBreakdownDto;
}