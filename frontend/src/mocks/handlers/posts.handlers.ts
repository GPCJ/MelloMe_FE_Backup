// 게시글 핸들러 — 목록, 상세, 작성, 수정, 삭제
import { http, HttpResponse } from 'msw';
import { mockPosts } from '../data/posts';
import { testAccounts } from '../data/users';
import { currentUserEmail } from '../state';

const API = import.meta.env.VITE_API_BASE_URL;

export const postsHandlers = [
  http.get(`${API}/posts`, ({ request }) => {
    const url = new URL(request.url);
    const therapyArea = url.searchParams.get('therapyArea');
    const filtered = therapyArea
      ? mockPosts.filter((p) => p.therapyArea === therapyArea)
      : mockPosts;

    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const posts = filtered.map((p) => ({
      id: p.id,
      contentPreview: p.contentPreview,
      authorNickname: p.authorNickname,
      authorProfileImageUrl: p.authorProfileImageUrl,
      authorVerificationStatus: p.authorVerificationStatus,
      therapyArea: p.therapyArea,
      viewCount: p.viewCount,
      commentCount: p.commentCount,
      hasAttachment: p.hasAttachment,
      isBlurred: p.isBlurred && currentAccount?.role !== 'THERAPIST' && currentAccount?.role !== 'ADMIN',
      createdAt: p.createdAt,
    }));

    return HttpResponse.json({
      success: true,
      data: {
        posts,
        page: 0,
        size: 20,
        totalElements: posts.length,
        totalPages: 1,
        hasNext: false,
      },
    });
  }),

  http.get(`${API}/posts/:postId`, ({ params }) => {
    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (!post) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;

    return HttpResponse.json({
      success: true,
      data: {
        id: post.id,
        content: post.content,
        authorId: post.authorId,
        authorNickname: post.authorNickname,
        authorVerificationStatus: post.authorVerificationStatus,
        therapyArea: post.therapyArea,
        viewCount: post.viewCount,
        canEdit: currentAccount?.id === post.authorId,
        canDelete: currentAccount?.id === post.authorId,
        attachments: post.hasAttachment
          ? [{ id: 1, originalFilename: '자료.pdf', contentType: 'application/pdf', sizeBytes: 1024000, extension: 'pdf', downloadUrl: '#', createdAt: post.createdAt }]
          : [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });
  }),

  http.post(`${API}/posts`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const newPost = {
      id: Date.now(),
      contentPreview: ((body.content as string) || '').slice(0, 100),
      content: body.content as string,
        therapyArea: (body.therapyArea as string) || 'UNSPECIFIED',
      viewCount: 0,
      commentCount: 0,
      hasAttachment: false,
      isBlurred: false,
      authorId: currentAccount?.id ?? 1,
      authorNickname: currentAccount?.nickname ?? '테스트치료사',
      authorProfileImageUrl: null,
      authorVerificationStatus: currentAccount?.role === 'THERAPIST' || currentAccount?.role === 'ADMIN' ? 'APPROVED' : 'NOT_REQUESTED',
      canEdit: true,
      canDelete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPosts.unshift(newPost as unknown as (typeof mockPosts)[0]);
    return HttpResponse.json({ success: true, data: newPost }, { status: 201 });
  }),

  http.patch(`${API}/posts/:postId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (!post) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

    if (body.content !== undefined) post.content = body.content as string;
    if (body.therapyArea !== undefined) post.therapyArea = body.therapyArea as string;

    return HttpResponse.json({
      success: true,
      data: {
        ...post,
        canEdit: true,
        canDelete: true,
      },
    });
  }),

  http.delete(
    `${API}/posts/:postId`,
    ({ params }) => {
      const idx = mockPosts.findIndex((p) => p.id === Number(params.postId));
      if (idx !== -1) mockPosts.splice(idx, 1);
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
