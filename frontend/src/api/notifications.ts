import axiosInstance from './axiosInstance';
import type {
  PaginatedNotifications,
  UnreadCountResponse,
} from '../types/notification';

export async function fetchNotifications(
  page = 0,
  size = 20,
): Promise<PaginatedNotifications> {
  const res = await axiosInstance.get('/notifications', { params: { page, size } });
  return res.data?.data ?? res.data;
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const res = await axiosInstance.get('/notifications/unread-count');
  return res.data?.data ?? res.data;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await axiosInstance.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await axiosInstance.patch('/notifications/read-all');
}

export async function deleteNotification(notificationId: number): Promise<void> {
  await axiosInstance.delete(`/notifications/${notificationId}`);
}
