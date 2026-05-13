import { http, HttpResponse } from 'msw';
import { mockNotifications } from '../data/notifications';

const API = import.meta.env.VITE_API_BASE_URL;

// 런타임 상태 (읽음/삭제 반영)
let notifications = [...mockNotifications];

export const notificationsHandlers = [
  // 알림 목록 조회
  http.get(`${API}/notifications`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '20');

    const start = page * size;
    const items = notifications.slice(start, start + size);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        pageNumber: page,
        pageSize: size,
        totalElements: notifications.length,
        hasNext: start + size < notifications.length,
      },
    });
  }),

  // 미읽은 알림 수
  http.get(`${API}/notifications/unread-count`, () => {
    const count = notifications.filter((n) => !n.read).length;
    return HttpResponse.json({
      success: true,
      data: { count },
    });
  }),

  // 단건 읽음 처리
  http.patch(`${API}/notifications/:id/read`, ({ params }) => {
    const id = Number(params.id);
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  // 전체 읽음 처리
  http.patch(`${API}/notifications/read-all`, () => {
    const now = new Date().toISOString();
    notifications = notifications.map((n) => ({
      ...n,
      read: true,
      readAt: n.readAt ?? now,
    }));
    return new HttpResponse(null, { status: 204 });
  }),

  // 알림 삭제
  http.delete(`${API}/notifications/:id`, ({ params }) => {
    const id = Number(params.id);
    notifications = notifications.filter((n) => n.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // SSE 구독 — MSW에서 스트림 모킹 제한으로 빈 응답 반환
  http.get(`${API}/notifications/subscribe`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
