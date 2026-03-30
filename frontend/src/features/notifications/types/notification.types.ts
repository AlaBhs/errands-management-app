import type { NotificationType } from "./notification.enums";

// ── DTO returned by the backend ───────────────────────────────────────────────

export interface NotificationDto {
  id: string;
  message: string;
  type: NotificationType;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

// ── Paginated response data (nested inside ApiResponse.data) ──────────────────

export interface NotificationPageData {
  notifications: NotificationDto[];
  unreadCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ── Query params for GET /api/notifications ───────────────────────────────────

export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}