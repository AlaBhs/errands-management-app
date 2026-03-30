import { create } from "zustand";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import type { NotificationDto } from "@/features/notifications/types";

interface NotificationStore {
  notifications: NotificationDto[];
  unreadCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasFetched: boolean;
  fetchInitial: () => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  appendRealtime: (notification: NotificationDto) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  isLoadingMore: false,
  hasFetched: false,

  // ── Fetch first page ────────────────────────────────────────────────────────
  fetchInitial: async () => {
    // Skip if already fetched — prevents re-fetch on every dropdown open.
    // Realtime pushes via appendRealtime keep the list fresh between opens.
    if (get().hasFetched) return;

    set({ isLoading: true });
    try {
      const res = await notificationsApi.getAll({ page: 1, pageSize: 5 });
      const { notifications, unreadCount, totalPages } = res.data;
      set({ notifications, unreadCount, totalPages, page: 1, hasFetched: true });
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
        pageSize: 5,
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
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    try {
      await notificationsApi.markAsRead(id);
    } catch {
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
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      await get().fetchInitial();
    }
  },

  // ── Prepend a real-time notification from SignalR ────────────────────────────
  appendRealtime: (notification: NotificationDto) => {
    set((state) => ({
      // Keep only the 5 most recent in the dropdown slice
      notifications: [notification, ...state.notifications].slice(0, 5),
      unreadCount: state.unreadCount + 1,
    }));
  },
}));