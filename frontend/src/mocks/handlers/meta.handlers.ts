// 메타 핸들러 — 옵션 목록 조회
import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_BASE_URL;

export const metaHandlers = [
  http.get(`${API}/meta/options`, () =>
    HttpResponse.json({
      boardTypes: ['therapy_board', 'document_board', 'anonymous_board'],
      therapyAreas: ['UNSPECIFIED', 'OCCUPATIONAL', 'SPEECH', 'COGNITIVE', 'PLAY'],
      reactionTypes: ['EMPATHY', 'APPRECIATE', 'HELPFUL'],
    }),
  ),
];
