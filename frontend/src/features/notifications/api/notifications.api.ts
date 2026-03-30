import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  NotificationPageData,
  NotificationQueryParams,
} from "@/features/notifications/types";

export const notificationsApi = {
  getAll: (params?: NotificationQueryParams) =>
    apiClient
      .get<ApiResponse<NotificationPageData>>("/notifications", { params })
      .then((res) => res.data),

  getUnreadCount: () =>
    apiClient
      .get<ApiResponse<number>>("/notifications/unread-count")
      .then((res) => res.data),

  markAsRead: (id: string) =>
    apiClient
      .post<void>(`/notifications/${id}/read`, {})
      .then((res) => res.data),

  markAllAsRead: () =>
    apiClient
      .post<void>("/notifications/read-all", {})
      .then((res) => res.data),
};