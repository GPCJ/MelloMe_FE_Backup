import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_BASE_URL;

const mockAuthor = {
  id: 1,
  nickname: '테스트치료사',
  profileImageUrl: null,
};

const mockPosts = [
  {
    id: 1,
    board: 'therapy_board',
    title: '감각통합 활동 자료 공유',
    therapyArea: 'OCCUPATIONAL_THERAPY',
    ageGroup: 'AGE_6_12',
    viewCount: 42,
    commentCount: 3,
    likeCount: 5,
    dislikeCount: 0,
    author: mockAuthor,
    createdAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 2,
    board: 'therapy_board',
    title: '아동 집중력 향상 활동 후기',
    therapyArea: 'OCCUPATIONAL_THERAPY',
    ageGroup: 'UNSPECIFIED',
    viewCount: 18,
    commentCount: 1,
    likeCount: 2,
    dislikeCount: 0,
    author: mockAuthor,
    createdAt: '2026-03-12T14:00:00Z',
  },
];

const mockComments = [
  {
    id: 1,
    postId: 1,
    author: mockAuthor,
    parentCommentId: null,
    content: '좋은 자료 감사합니다!',
    deleted: false,
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 2,
    postId: 1,
    author: { id: 2, nickname: '테스트유저', profileImageUrl: null },
    parentCommentId: 1,
    content: '저도 도움이 됐어요!',
    deleted: false,
    createdAt: '2026-03-10T12:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
];

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  accessTokenExpiresInSec: 3600,
  refreshTokenExpiresInSec: 604800,
};

const testAccounts: Record<
  string,
  { role: string; canAccessCommunity: boolean; nickname: string }
> = {
  'testUser@test.com': {
    role: 'USER',
    canAccessCommunity: false,
    nickname: '테스트유저',
  },
  'testTherapist@test.com': {
    role: 'THERAPIST',
    canAccessCommunity: true,
    nickname: '테스트치료사',
  },
  'admin@test.com': {
    role: 'ADMIN',
    canAccessCommunity: true,
    nickname: '관리자',
  },
};

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const account = testAccounts[body.email];
    if (account && body.password === '1111') {
      return HttpResponse.json({
        isNewUser: false,
        user: {
          id: 1,
          email: body.email,
          nickname: account.nickname,
          profileImageUrl: null,
          role: account.role,
          canAccessCommunity: account.canAccessCommunity,
          therapistVerification: null,
        },
        tokens: mockTokens,
      });
    }
    return HttpResponse.json(
      {
        code: 'AUTH_401',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      },
      { status: 401 },
    );
  }),

  http.post(`${API}/auth/oauth/google`, () =>
    HttpResponse.json({
      isNewUser: false,
      user: {
        id: 1,
        email: 'testUser@test.com',
        nickname: '테스트유저',
        profileImageUrl: null,
        role: 'USER',
        canAccessCommunity: false,
        therapistVerification: null,
      },
      tokens: mockTokens,
    }),
  ),

  http.get(`${API}/meta/options`, () =>
    HttpResponse.json({
      boardTypes: ['therapy_board', 'document_board', 'anonymous_board'],
      therapyAreas: ['UNSPECIFIED', 'OCCUPATIONAL_THERAPY'],
      ageGroups: ['UNSPECIFIED', 'AGE_6_12'],
      reactionTypes: ['LIKE', 'DISLIKE'],
    }),
  ),

  http.get(`${API}/home`, () =>
    HttpResponse.json({
      viewer: {
        authenticated: false,
        role: null,
        nickname: null,
        profileImageUrl: null,
        canAccessCommunity: false,
        therapistVerification: null,
      },
      sections: [
        {
          key: 'POPULAR_THERAPY',
          title: '인기 임상톡톡',
          board: 'therapy_board',
          sort: 'MOST_VIEWED',
          locked: true,
          lockedReason: 'LOGIN_REQUIRED',
          placeholderCount: 3,
          items: [],
        },
      ],
    }),
  ),

  http.get(`${API}/me`, () =>
    HttpResponse.json(
      { code: 'AUTH_401', message: 'Unauthorized' },
      { status: 401 },
    ),
  ),

  // Posts
  http.get(`${API}/posts`, () =>
    HttpResponse.json({
      items: mockPosts,
      page: { number: 1, size: 20, totalElements: 2, totalPages: 1 },
    }),
  ),

  http.get(`${API}/posts/:postId`, ({ params }) => {
    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (!post) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({
      ...post,
      content: '게시글 본문 내용입니다.',
      scrapped: false,
    });
  }),

  http.post(`${API}/posts`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newPost = {
      ...body,
      id: Date.now(),
      viewCount: 0,
      commentCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      author: mockAuthor,
      createdAt: new Date().toISOString(),
      content: body.content,
      scrapped: false,
    };
    return HttpResponse.json(newPost, { status: 201 });
  }),

  http.patch(`${API}/posts/:postId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (!post) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({
      ...post,
      ...body,
      content: body.content ?? '게시글 본문 내용입니다.',
      scrapped: false,
    });
  }),

  http.delete(
    `${API}/posts/:postId`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Comments
  http.get(`${API}/posts/:postId/comments`, ({ params }) => {
    const comments = mockComments.filter(
      (c) => c.postId === Number(params.postId),
    );
    return HttpResponse.json(comments);
  }),

  http.post(`${API}/posts/:postId/comments`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newComment = {
      id: Date.now(),
      postId: Number(params.postId),
      author: mockAuthor,
      parentCommentId: body.parentCommentId ?? null,
      content: body.content,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newComment, { status: 201 });
  }),

  http.delete(
    `${API}/posts/:postId/comments/:commentId`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
