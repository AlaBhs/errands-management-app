import type { RequestCategory } from '@/features/requests/types/request.enums';
import type { NotificationType } from '@/features/notifications/types/notification.enums';

export type PriorityLevel = 'Low' | 'Normal' | 'High' | 'Urgent';
export const ALL_PRIORITY_LEVELS: PriorityLevel[] = ['Low', 'Normal', 'High', 'Urgent'];

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export const ALL_DAYS: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface CollaboratorDefaultsDto {
  defaultCategory: RequestCategory | null;
  defaultPriority: PriorityLevel | null;
  defaultContactPerson: string | null;
  defaultContactPhone: string | null;
}

export interface CourierDefaultsDto {
  baseLatitude: number | null;
  baseLongitude: number | null;
  baseCity: string | null;
  maxConcurrentAssignments: number | null;
  availableDaysOfWeek: DayOfWeek[];
  availableFromHour: number | null;
  availableToHour: number | null;
}

export interface UserPreferencesDto {
  userId: string;
  language: string | null;
  theme: string | null;
  defaultView: string | null;
  disabledNotificationTypes: NotificationType[];
  collaboratorDefaults: CollaboratorDefaultsDto | null;
  courierDefaults: CourierDefaultsDto | null;
}

export interface UpdatePreferencesPayload {
  language: string | null;
  theme: string | null;
  defaultView: string | null;
  disabledNotificationTypes: NotificationType[];
}

export interface UpdateCollaboratorDefaultsPayload {
  defaultCategory: RequestCategory | null;
  defaultPriority: PriorityLevel | null;
  defaultContactPerson: string | null;
  defaultContactPhone: string | null;
}

export interface UpdateCourierDefaultsPayload {
  baseLatitude: number | null;
  baseLongitude: number | null;
  baseCity: string | null;
  maxConcurrentAssignments: number | null;
  availableDaysOfWeek: DayOfWeek[];
  availableFromHour: number | null;
  availableToHour: number | null;
}