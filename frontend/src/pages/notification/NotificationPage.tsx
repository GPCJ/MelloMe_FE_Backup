import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import NarrowPage from '../../components/common/NarrowPage';
import Pagination from '../../components/common/Pagination';
import { useNotificationStore } from '../../stores/useNotificationStore';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../api/notifications';
import { getNotificationRoute } from '../../utils/notificationRoute';
import type { NotificationResponse, PaginatedNotifications } from '../../types/notification';

const PAGE_SIZE = 20;

export default function NotificationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeMarkAsRead = useNotificationStore((s) => s.markAsRead);
  const storeMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const storeRemove = useNotificationStore((s) => s.removeNotification);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [page, setPage] = useState(1);
  const queryKey = ['notifications', page - 1] as const;

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: () => fetchNotifications(page - 1, PAGE_SIZE),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const data = notificationsQuery.data;
  const notifications = data?.items ?? [];
  const totalPages = data
    ? Math.max(1, data.totalPages ?? Math.ceil(data.totalElements / data.size))
    : 1;
  const loading = notificationsQuery.isLoading;

  // 낙관 업데이트는 RQ 캐시(현재 페이지)와 store(unreadCount 동기화) 둘 다 갱신합니다.
  // 실패 시 캐시는 롤백되지만 store unreadCount는 다음 SSE/페이지 전환 시 자연 보정에 맡깁니다.
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: (id: number) => {
      storeMarkAsRead(id);
      const previous = queryClient.getQueryData<PaginatedNotifications>(queryKey);
      queryClient.setQueryData<PaginatedNotifications>(queryKey, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((n) =>
                n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n,
              ),
            }
          : old,
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      console.error('알림 읽음 처리 실패:', err);
      toast.error('알림을 읽음 처리하지 못했습니다.');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => {
      storeMarkAllAsRead();
      const previous = queryClient.getQueryData<PaginatedNotifications>(queryKey);
      queryClient.setQueryData<PaginatedNotifications>(queryKey, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((n) => ({
                ...n,
                read: true,
                readAt: n.readAt ?? new Date().toISOString(),
              })),
            }
          : old,
      );
      return { previous };
    },
    onError: (err, _v, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      console.error('모두 읽음 처리 실패:', err);
      toast.error('모두 읽음 처리하지 못했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { id: number; wasUnread: boolean }) => deleteNotification(vars.id),
    onMutate: ({ id, wasUnread }) => {
      storeRemove(id, wasUnread);
      const previous = queryClient.getQueryData<PaginatedNotifications>(queryKey);
      queryClient.setQueryData<PaginatedNotifications>(queryKey, (old) =>
        old ? { ...old, items: old.items.filter((n) => n.id !== id) } : old,
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      console.error('알림 삭제 실패:', err);
      toast.error('알림을 삭제하지 못했습니다.');
    },
  });

  function handleClick(n: NotificationResponse) {
    if (!n.read) {
      markAsReadMutation.mutate(n.id);
    }
    const route = getNotificationRoute(n.type, n.referenceId);
    navigate(route);
  }

  function handleMarkAllRead() {
    markAllAsReadMutation.mutate();
  }

  function handleDelete(e: React.MouseEvent, n: NotificationResponse) {
    e.stopPropagation();
    deleteMutation.mutate({ id: n.id, wasUnread: !n.read });
  }

  return (
    <NarrowPage>
      <PageHeader
        title="알림"
        backTo="/posts"
        rightAction={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              모두 읽음
            </button>
          ) : undefined
        }
      />

      <div>
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
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </NarrowPage>
  );
}
