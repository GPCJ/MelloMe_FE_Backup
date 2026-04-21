// 리액션 핸들러 — 게시글 리액션 조회, 토글
// 백엔드 명세 변경(2026-04-21): LIKE/CURIOUS/USEFUL + likeCount/curiousCount/usefulCount
import { http, HttpResponse } from 'msw';
import { mockReactions } from '../data/posts';

const API = import.meta.env.VITE_API_BASE_URL;

type ReactionKey = 'likeCount' | 'curiousCount' | 'usefulCount';

function keyFor(type: string): ReactionKey {
  if (type === 'LIKE') return 'likeCount';
  if (type === 'CURIOUS') return 'curiousCount';
  return 'usefulCount';
}

export const reactionsHandlers = [
  http.get(`${API}/posts/:postId/reaction`, ({ params }) => {
    const postId = Number(params.postId);
    const reaction = mockReactions[postId] ?? {
      likeCount: 0,
      curiousCount: 0,
      usefulCount: 0,
      myReactionType: null,
    };
    return HttpResponse.json({
      success: true,
      data: {
        postId,
        ...reaction,
      },
    });
  }),

  http.put(`${API}/posts/:postId/reaction`, async ({ params, request }) => {
    const postId = Number(params.postId);
    const body = (await request.json()) as { reactionType: string };

    if (!mockReactions[postId]) {
      mockReactions[postId] = { likeCount: 0, curiousCount: 0, usefulCount: 0, myReactionType: null };
    }
    const r = mockReactions[postId];
    const type = body.reactionType;

    if (r.myReactionType === type) {
      // 토글 해제
      const key = keyFor(type);
      r[key] = Math.max(0, r[key] - 1);
      r.myReactionType = null;
    } else {
      // 이전 리액션 해제
      if (r.myReactionType) {
        const prevKey = keyFor(r.myReactionType);
        r[prevKey] = Math.max(0, r[prevKey] - 1);
      }
      // 새 리액션 추가
      const newKey = keyFor(type);
      r[newKey] = r[newKey] + 1;
      r.myReactionType = type;
    }

    return HttpResponse.json({ success: true, data: { postId, ...r } });
  }),
];
