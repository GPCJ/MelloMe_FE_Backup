import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import MobilePageHeader from '../../components/common/MobilePageHeader';
import Pagination from '../../components/common/Pagination';
import { useNotificationStore } from '../../stores/useNotificationStore';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../api/notifications';
import { getNotificationRoute } from '../../utils/notificationRoute';
import type { NotificationResponse } from '../../types/notification';

export default function NotificationPage() {
  const navigate = useNavigate();
  const storeMarkAsRead = useNotificationStore((s) => s.markAsRead);
  const storeMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const storeRemove = useNotificationStore((s) => s.removeNotification);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage(page);
  }, [page]);

  async function loadPage(p: number) {
    setLoading(true);
    try {
      const data = await fetchNotifications(p - 1, 20);
      setNotifications(data.items);
      setTotalPages(Math.max(1, Math.ceil(data.totalElements / data.pageSize)));
    } catch {
      // 조회 실패 시 빈 목록 유지
    } finally {
      setLoading(false);
    }
  }

  function handleClick(n: NotificationResponse) {
    if (!n.read) {
      storeMarkAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, read: true, readAt: new Date().toISOString() } : item,
        ),
      );
      markNotificationAsRead(n.id).catch(() => {});
    }
    const route = getNotificationRoute(n.type, n.postId);
    navigate(route);
  }

  async function handleMarkAllRead() {
    storeMarkAllAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })),
    );
    markAllNotificationsAsRead().catch(() => {});
  }

  async function handleDelete(e: React.MouseEvent, n: NotificationResponse) {
    e.stopPropagation();
    storeRemove(n.id);
    setNotifications((prev) => prev.filter((item) => item.id !== n.id));
    deleteNotification(n.id).catch(() => {});
  }

  return (
    <div className="pb-20 md:pb-0">
      <MobilePageHeader
        title="알림"
        backTo="/posts"
        rightAction={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-500 hover:text-blue-700 pr-2"
            >
              모두 읽음
            </button>
          ) : undefined
        }
      />

      {/* 데스크탑 헤더 */}
      <div className="hidden md:flex items-center justify-between px-4 py-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900">알림</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            모두 읽음
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">알림이 없습니다</div>
        ) : (
          <>
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start justify-between gap-3 px-4 py-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    n.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        n.read ? 'text-gray-600' : 'font-medium text-gray-900'
                      }`}
                    >
                      {n.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, n)}
                    className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
