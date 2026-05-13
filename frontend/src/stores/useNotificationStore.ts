import { create } from 'zustand';
import type { NotificationResponse } from '../types/notification';

interface NotificationState {
  notifications: NotificationResponse[];
  unreadCount: number;
  isConnected: boolean;
  lastEventId: string | null;

  setNotifications: (notifications: NotificationResponse[]) => void;
  addNotification: (notification: NotificationResponse) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number, wasUnread?: boolean) => void;
  setConnected: (connected: boolean) => void;
  setLastEventId: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  lastEventId: null,

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  removeNotification: (id, wasUnread) =>
    set((state) => {
      // wasUnread 명시 시 그 값을, 아니면 store 배열에서 검사 (SSE로 도착한 알림 대비 fallback 유지)
      const inUnread =
        wasUnread !== undefined
          ? wasUnread
          : state.notifications.some((n) => n.id === id && !n.read);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: inUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }),

  setConnected: (connected) => set({ isConnected: connected }),

  setLastEventId: (id) => set({ lastEventId: id }),

  clear: () =>
    set({
      notifications: [],
      unreadCount: 0,
      isConnected: false,
      lastEventId: null,
    }),
}));
