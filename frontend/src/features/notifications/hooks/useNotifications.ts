import { useCallback, useEffect, useState } from "react";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { useNotificationStore } from "@/features/notifications/store/notificationStore";
import type { NotificationDto } from "@/features/notifications/types";

const PAGE_SIZE = 10;

interface UseNotificationsReturn {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  unreadOnly: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  setUnreadOnly: (value: boolean) => void;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [unreadOnly, setUnreadOnlyState] = useState(false);

  // Keep badge in sync with the global store
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  const fetchPage = useCallback(
    async (pageNum: number, unreadOnlyFilter: boolean) => {
      const res = await notificationsApi.getAll({
        page: pageNum,
        pageSize: PAGE_SIZE,
        unreadOnly: unreadOnlyFilter,
      });
      return res.data;
    },
    [],
  );

  // Fetch first page whenever the filter changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchPage(1, unreadOnly)
      .then((data) => {
        if (cancelled) return;
        setNotifications(data.notifications);
        setPage(1);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [unreadOnly, fetchPage]);

  function setUnreadOnly(value: boolean) {
    setUnreadOnlyState(value);
  }

  async function loadMore() {
    if (page >= totalPages) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const data = await fetchPage(nextPage, unreadOnly);
      setNotifications((prev) => [...prev, ...data.notifications]);
      setPage(nextPage);
      setTotalPages(data.totalPages);
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationsApi.markAsRead(id);
      await fetchUnreadCount();
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationsApi.markAllAsRead();
      await fetchUnreadCount();
    } catch {
      const data = await fetchPage(1, unreadOnly);
      setNotifications(data.notifications);
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    unreadOnly,
    page,
    totalPages,
    totalCount,
    setUnreadOnly,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}