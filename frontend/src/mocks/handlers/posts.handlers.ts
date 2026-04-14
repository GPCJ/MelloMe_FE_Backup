// 게시글 핸들러 — 목록, 상세, 작성, 수정, 삭제
import { http, HttpResponse } from 'msw';
import { mockPosts } from '../data/posts';
import { testAccounts } from '../data/users';
import { currentUserEmail } from '../state';

const API = import.meta.env.VITE_API_BASE_URL;

// 무한 스크롤 검증용 — 60개 가짜 피드 데이터 (모듈 캐싱)
const FEED_TOTAL = 60;
const therapyAreas = ['UNSPECIFIED', 'SPEECH', 'PLAY', 'COGNITIVE', 'OCCUPATIONAL', 'BEHAVIOR'] as const;
const mockFeedItems = Array.from({ length: FEED_TOTAL }, (_, i) => {
  const id = FEED_TOTAL - i;  // 60, 59, 58, ... 1 (최신순)
  return {
    id,
    postType: 'COMMUNITY' as const,
    contentPreview: `[목업 ${id}] 무한 스크롤 검증용 게시글입니다. 스크롤하면 다음 페이지가 자동으로 로드됩니다.`,
    authorNickname: `테스트치료사${(id % 5) + 1}`,
    therapyArea: therapyAreas[id % therapyAreas.length],
    visibility: 'PUBLIC' as const,
    viewCount: 100 + id * 3,
    popularityScore: 20 + (id % 10) * 1.5,
    createdAt: new Date(2026, 3, 13, 12, 0, 0, -id * 60_000).toISOString(),
    scrapped: false,
  };
});

function encodeCursor(lastId: number): string {
  return btoa(JSON.stringify({ lastId }));
}

function decodeCursor(cursor: string): number | null {
  try {
    const parsed = JSON.parse(atob(cursor));
    return typeof parsed.lastId === 'number' ? parsed.lastId : null;
  } catch {
    return null;
  }
}

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

  http.get(`${API}/posts/feed`, ({ request }) => {
    const url = new URL(request.url);
    const rawSize = Number(url.searchParams.get('size') ?? '20');
    const size = Math.min(50, Math.max(1, isNaN(rawSize) ? 20 : rawSize));
    const cursor = url.searchParams.get('cursor');

    let startIdx = 0;
    if (cursor) {
      const lastId = decodeCursor(cursor);
      if (lastId === null) {
        return HttpResponse.json(
          { success: false, code: 'INVALID_INPUT', message: 'invalid cursor' },
          { status: 400 },
        );
      }
      const idx = mockFeedItems.findIndex((p) => p.id === lastId);
      startIdx = idx === -1 ? mockFeedItems.length : idx + 1;
    }

    const slice = mockFeedItems.slice(startIdx, startIdx + size);
    const hasNext = startIdx + size < mockFeedItems.length;
    const nextCursor = hasNext && slice.length > 0
      ? encodeCursor(slice[slice.length - 1].id)
      : null;

    return HttpResponse.json({
      success: true,
      data: {
        items: slice,
        nextCursor,
        hasNext,
        size,
      },
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
