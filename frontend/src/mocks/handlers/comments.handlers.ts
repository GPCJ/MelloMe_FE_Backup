// 댓글 핸들러 — 목록 조회, 작성, 삭제
import { http, HttpResponse } from 'msw';
import { mockComments } from '../data/comments';
import { testAccounts } from '../data/users';
import { currentUserEmail } from '../state';

const API = import.meta.env.VITE_API_BASE_URL;

export const commentsHandlers = [
  http.get(`${API}/posts/:postId/comments`, ({ params }) => {
    const comments = mockComments.filter(
      (c) => c.postId === Number(params.postId),
    );
    return HttpResponse.json({ success: true, data: comments });
  }),

  http.post(`${API}/posts/:postId/comments`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const newComment = {
      id: Date.now(),
      postId: Number(params.postId),
      parentCommentId: (body.parentCommentId as number) ?? null,
      authorId: currentAccount?.id ?? 1,
      authorNickname: currentAccount?.nickname ?? '테스트치료사',
      authorRole: currentAccount?.role ?? 'THERAPIST',
      content: body.content,
      deleted: false,
      canEdit: true,
      canDelete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };
    return HttpResponse.json(
      { success: true, data: newComment },
      { status: 201 },
    );
  }),

  http.delete(
    `${API}/comments/:commentId`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
