// 스크랩 핸들러 — 스크랩 등록, 해제
import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_BASE_URL;

export const scrapHandlers = [
  http.post(
    `${API}/posts/:postId/scrap`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.delete(
    `${API}/posts/:postId/scrap`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
