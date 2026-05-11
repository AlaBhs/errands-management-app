import type { RequestCategory } from '@/features/requests/types/request.enums';
import type { NotificationType } from '@/features/notifications/types/notification.enums';
import type { UserRole } from '@/features/auth/types/auth.enums';

export type { RequestCategory, NotificationType, UserRole };

export const ALL_REQUEST_CATEGORIES: RequestCategory[] = [
  'OfficeSupplies',
  'ITEquipment',
  'Travel',
  'Facilities',
  'Other',
];

export const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  'RequestCreated',
  'RequestAssigned',
  'RequestStarted',
  'RequestCompleted',
  'RequestCancelled',
  'DeliveryPickedUp',
  'DeliveryHandedToReception',
  'General',
];

export const ALL_ROLES: UserRole[] = ['Admin', 'Collaborator', 'Courier', 'Reception'];

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  RequestCreated:           'New request submitted',
  RequestAssigned:          'Request assigned to courier',
  RequestStarted:           'Request work started',
  RequestCompleted:         'Request completed',
  RequestCancelled:         'Request cancelled',
  DeliveryPickedUp:         'Delivery picked up by courier',
  DeliveryHandedToReception:'Delivery handed to reception',
  General:                  'General notification',
};

export const CATEGORY_LABELS: Record<string, string> = {
  OfficeSupplies: 'Office Supplies',
  ITEquipment:    'IT Equipment',
  Travel:         'Travel',
  Facilities:     'Facilities',
  Other:          'Other',
};

export interface PriorityWeightsDto {
  availabilityWeight: number;
  proximityWeight: number;
  performanceWeight: number;
}

export interface RecommendationPolicyDto {
  maxActiveAssignments: number;
  maxScoringDistanceKm: number;
  normalPriorityWeights: PriorityWeightsDto;
  urgentPriorityWeights: PriorityWeightsDto;
}

export interface SlaPolicyDto {
  riskThresholdPercent: number;
  monitorIntervalMinutes: number;
  alertCooldownHours: number;
}

export interface ExpensePolicyDto {
  categoryBudgetCaps: Partial<Record<RequestCategory, number>>;
  overrunFlagThresholdPercent: number;
}

export interface NotificationPolicyDto {
  disabledTypesByRole: Partial<Record<NotificationType, UserRole[]>>;
}

export interface RequestPolicyDto {
  enabledCategories: RequestCategory[];
  isContactPersonRequired: boolean;
  minDeadlineAdvanceHours: number;
}

export interface SystemConfigurationDto {
  recommendationPolicy: RecommendationPolicyDto;
  slaPolicy: SlaPolicyDto;
  expensePolicy: ExpensePolicyDto;
  notificationPolicy: NotificationPolicyDto;
  requestPolicy: RequestPolicyDto;
}

export interface ConfigurationChangeLogDto {
  id: string;
  changedAt: string;
  changedByUserId: string;
  section: string;
  previousValueJson: string;
  newValueJson: string;
}

export interface PublicConfigDto {
  enabledCategories: RequestCategory[];
  minDeadlineAdvanceHours: number;
  categoryBudgetCaps: Partial<Record<RequestCategory, number>>;
}

export interface ChangelogParams {
  section?: string;
  page?: number;
  pageSize?: number;
}