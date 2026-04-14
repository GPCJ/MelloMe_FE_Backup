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
    const account = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const isPrivileged = account?.role === 'THERAPIST' || account?.role === 'ADMIN';

    const filtered = therapyArea
      ? mockPosts.filter((p) => p.therapyArea === therapyArea)
      : mockPosts;

    const items = filtered.map((p) => {
      const isPrivate = p.visibility === 'PRIVATE';
      const blurred = isPrivate && !isPrivileged;
      return {
        id: p.id,
        postType: 'COMMUNITY' as const,
        contentPreview: blurred ? '' : p.contentPreview,
        authorNickname: p.authorNickname,
        authorProfileImageUrl: p.authorProfileImageUrl,
        authorVerificationStatus: p.authorVerificationStatus,
        therapyArea: p.therapyArea,
        visibility: p.visibility ?? ('PUBLIC' as const),
        viewCount: p.viewCount,
        commentCount: p.commentCount,
        hasAttachment: p.hasAttachment,
        isBlurred: blurred,
        createdAt: p.createdAt,
        scrapped: false,
      };
    });

    return HttpResponse.json({
      items,
      page: 0,
      size: 20,
      totalElements: items.length,
      totalPages: 1,
      hasNext: false,
    });
  }),

  http.get(`${API}/posts/:postId`, ({ params }) => {
    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (!post) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const isPrivileged = currentAccount?.role === 'THERAPIST' || currentAccount?.role === 'ADMIN';
    const isPrivate = post.visibility === 'PRIVATE';
    const blurred = isPrivate && !isPrivileged;

    return HttpResponse.json({
      id: post.id,
      content: blurred ? '' : post.content,
      postType: 'COMMUNITY',
      authorId: post.authorId,
      authorNickname: post.authorNickname,
      therapyArea: post.therapyArea,
      visibility: post.visibility ?? 'PUBLIC',
      viewCount: post.viewCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      canEdit: currentAccount?.id === post.authorId,
      canDelete: currentAccount?.id === post.authorId,
      attachments: blurred
        ? []
        : post.hasAttachment
          ? [{ id: 1, originalFilename: '자료.pdf', contentType: 'application/pdf', sizeBytes: 1024000, extension: 'pdf', downloadUrl: '#', createdAt: post.createdAt }]
          : [],
      isBlurred: blurred,
      scrapped: false,
    });
  }),

  http.post(`${API}/posts`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const isPrivileged = currentAccount?.role === 'THERAPIST' || currentAccount?.role === 'ADMIN';
    if (body.visibility === 'PRIVATE' && !isPrivileged) {
      return HttpResponse.json(
        { code: 'FORBIDDEN', message: '비공개 게시글은 치료사만 작성할 수 있습니다.' },
        { status: 403 },
      );
    }
    const newPost = {
      id: Date.now(),
      contentPreview: ((body.content as string) || '').slice(0, 100),
      content: body.content as string,
      therapyArea: (body.therapyArea as string) || 'UNSPECIFIED',
      visibility: ((body.visibility as string) || 'PUBLIC') as 'PUBLIC' | 'PRIVATE',
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

    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const isPrivileged = currentAccount?.role === 'THERAPIST' || currentAccount?.role === 'ADMIN';
    if (body.visibility === 'PRIVATE' && !isPrivileged) {
      return HttpResponse.json(
        { code: 'FORBIDDEN', message: '비공개 게시글은 치료사만 작성할 수 있습니다.' },
        { status: 403 },
      );
    }

    if (body.content !== undefined) post.content = body.content as string;
    if (body.therapyArea !== undefined) post.therapyArea = body.therapyArea as string;
    if (body.visibility !== undefined) {
      (post as { visibility?: 'PUBLIC' | 'PRIVATE' }).visibility = body.visibility as 'PUBLIC' | 'PRIVATE';
    }

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
