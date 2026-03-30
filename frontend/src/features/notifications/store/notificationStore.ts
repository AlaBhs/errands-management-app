import { create } from "zustand";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import type { NotificationDto } from "@/features/notifications/types";

// ── State shape ───────────────────────────────────────────────────────────────

interface NotificationStore {
  // Data
  notifications: NotificationDto[];
  unreadCount: number;

  // Pagination
  page: number;
  totalPages: number;

  // Flags
  isLoading: boolean;
  isLoadingMore: boolean;

  // Actions
  fetchInitial: () => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  appendRealtime: (notification: NotificationDto) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  isLoadingMore: false,

  // ── Fetch first page ────────────────────────────────────────────────────────
  fetchInitial: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationsApi.getAll({ page: 1, pageSize: 10 });
      const { notifications, unreadCount, totalPages } = res.data;
      set({ notifications, unreadCount, totalPages, page: 1 });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Fetch next page and append ──────────────────────────────────────────────
  fetchMore: async () => {
    const { page, totalPages, notifications } = get();
    if (page >= totalPages) return;

    const nextPage = page + 1;
    set({ isLoadingMore: true });
    try {
      const res = await notificationsApi.getAll({
        page: nextPage,
        pageSize: 10,
      });
      set({
        notifications: [...notifications, ...res.data.notifications],
        page: nextPage,
        totalPages: res.data.totalPages,
      });
    } finally {
      set({ isLoadingMore: false });
    }
  },

  // ── Refresh badge count only (lightweight) ──────────────────────────────────
  fetchUnreadCount: async () => {
    const res = await notificationsApi.getUnreadCount();
    set({ unreadCount: res.data });
  },

  // ── Mark one notification as read ───────────────────────────────────────────
  markAsRead: async (id: string) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // Rollback on failure
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: false } : n,
        ),
        unreadCount: state.unreadCount + 1,
      }));
    }
  },

  // ── Mark all notifications as read ──────────────────────────────────────────
  markAllAsRead: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      // Rollback — re-fetch to restore correct state
      await get().fetchInitial();
    }
  },

  // ── Prepend a real-time notification from SignalR ────────────────────────────
  appendRealtime: (notification: NotificationDto) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));