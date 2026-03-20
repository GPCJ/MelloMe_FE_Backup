import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_BASE_URL;

const mockPosts = [
  {
    id: 1,
    title: '감각통합 활동 자료 공유',
    contentPreview: '감각통합 활동에 유용한 자료를 공유합니다...',
    therapyArea: 'OCCUPATIONAL',
    ageGroup: 'AGE_6_12',
    viewCount: 42,
    authorNickname: '테스트치료사',
    createdAt: '2026-03-15T08:00:00Z',
  },
  {
    id: 2,
    title: '아동 집중력 향상 활동 후기',
    contentPreview: '집중력 향상을 위한 활동 후기입니다...',
    therapyArea: 'OCCUPATIONAL',
    ageGroup: 'UNSPECIFIED',
    viewCount: 18,
    authorNickname: '테스트치료사',
    createdAt: '2026-03-15T06:00:00Z',
  },
  {
    id: 3,
    title: '5세 아동의 언어 발달 지연 케이스 - 조언 부탁드립니다',
    contentPreview: '언어 발달 지연 케이스 공유드립니다...',
    therapyArea: 'SPEECH',
    ageGroup: 'AGE_3_5',
    viewCount: 234,
    authorNickname: '언어치료사A',
    createdAt: '2026-03-15T07:00:00Z',
  },
  {
    id: 4,
    title: 'ADHD 아동의 감각통합 접근법에 대한 의견이 필요합니다',
    contentPreview: 'ADHD 아동 감각통합 접근법 의견 구합니다...',
    therapyArea: 'COGNITIVE',
    ageGroup: 'AGE_6_12',
    viewCount: 189,
    authorNickname: '인지치료사B',
    createdAt: '2026-03-15T03:00:00Z',
  },
  {
    id: 5,
    title: '놀이치료에서 경계선 설정이 어려워요',
    contentPreview: '놀이치료 경계선 설정 방법 공유해요...',
    therapyArea: 'PLAY',
    ageGroup: 'AGE_3_5',
    viewCount: 156,
    authorNickname: '놀이치료사C',
    createdAt: '2026-03-14T10:00:00Z',
  },
];

const mockComments = [
  {
    id: 1,
    postId: 1,
    parentCommentId: null,
    authorId: 1,
    authorNickname: '테스트치료사',
    authorRole: 'THERAPIST',
    content: '좋은 자료 감사합니다!',
    deleted: false,
    canEdit: true,
    canDelete: true,
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-03-10T11:00:00Z',
    replies: [],
  },
  {
    id: 2,
    postId: 1,
    parentCommentId: 1,
    authorId: 2,
    authorNickname: '테스트유저',
    authorRole: 'USER',
    content: '저도 도움이 됐어요!',
    deleted: false,
    canEdit: false,
    canDelete: false,
    createdAt: '2026-03-10T12:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
    replies: [],
  },
];

const mockTokens = {
  accessToken: 'mock-access-token',
  accessTokenExpiresInSec: 3600,
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
        success: true,
        data: {
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
        },
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
      success: true,
      data: {
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
      },
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
  http.get(`${API}/posts`, ({ request }) => {
    const url = new URL(request.url);
    const therapyArea = url.searchParams.get('therapyArea');
    const filtered = therapyArea
      ? mockPosts.filter((p) => p.therapyArea === therapyArea)
      : mockPosts;
    return HttpResponse.json({
      success: true,
      data: {
        posts: filtered,
        page: 1,
        size: 20,
        totalElements: filtered.length,
        totalPages: 1,
        hasNext: false,
      },
    });
  }),

  http.get(`${API}/posts/:postId`, ({ params }) => {
    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (!post) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({
      success: true,
      data: {
        ...post,
        content: '게시글 본문 내용입니다.',
      },
    });
  }),

  http.post(`${API}/posts`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newPost = {
      ...body,
      id: Date.now(),
      viewCount: 0,
      authorNickname: '테스트치료사',
      createdAt: new Date().toISOString(),
      content: body.content,
    };
    mockPosts.unshift(newPost as unknown as typeof mockPosts[0]);
    return HttpResponse.json({ success: true, data: newPost }, { status: 201 });
  }),

  http.patch(`${API}/posts/:postId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (!post) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({
      success: true,
      data: {
        ...post,
        ...body,
        content: body.content ?? '게시글 본문 내용입니다.',
      },
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
    return HttpResponse.json({ success: true, data: comments });
  }),

  http.post(`${API}/posts/:postId/comments`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newComment = {
      id: Date.now(),
      postId: Number(params.postId),
      parentCommentId: body.parentCommentId ?? null,
      authorId: 1,
      authorNickname: '테스트치료사',
      authorRole: 'THERAPIST',
      content: body.content,
      deleted: false,
      canEdit: true,
      canDelete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };
    return HttpResponse.json({ success: true, data: newComment }, { status: 201 });
  }),

  http.delete(
    `${API}/posts/:postId/comments/:commentId`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // My Page
  http.get(`${API}/me/dashboard`, () =>
    HttpResponse.json({
      stats: {
        postCount: 12,
        commentCount: 45,
        receivedReactionCount: 156,
        givenReactionCount: 89,
        downloadCount: 23,
        scrappedCount: 34,
      },
      activity: {
        weeklyPostCount: 3,
        weeklyCommentCount: 12,
        joinedAt: '2026-02-15T00:00:00Z',
      },
    }),
  ),

  http.get(`${API}/me/posts`, () =>
    HttpResponse.json([
      {
        id: 3,
        title: '5세 아동의 언어 발달 지연 케이스',
        contentPreview: '언어 발달 지연 케이스 공유드립니다...',
        therapyArea: 'SPEECH',
        ageGroup: 'AGE_3_5',
        viewCount: 234,
        authorNickname: '테스트치료사',
        createdAt: '2026-03-05T07:00:00Z',
      },
      {
        id: 4,
        title: 'ADHD 아동 감각통합 접근법',
        contentPreview: 'ADHD 아동 감각통합 접근법 의견 구합니다...',
        therapyArea: 'COGNITIVE',
        ageGroup: 'AGE_6_12',
        viewCount: 189,
        authorNickname: '테스트치료사',
        createdAt: '2026-03-03T03:00:00Z',
      },
    ]),
  ),

  http.get(`${API}/me/activity`, () =>
    HttpResponse.json({
      commentedPosts: [
        {
          post: {
            id: 5,
            title: '놀이치료 경계선 설정 방법',
            contentPreview: '놀이치료 경계선 설정 방법 공유해요...',
            therapyArea: 'PLAY',
            ageGroup: 'AGE_3_5',
            viewCount: 15,
            authorNickname: '놀이치료사C',
            createdAt: '2026-03-06T09:00:00Z',
          },
          myCommentPreview: '저도 비슷한 경험이 있어요. 일관된 규칙 설정이 중요로로 것 같습니다...',
          myCommentCreatedAt: '2026-03-06T10:00:00Z',
        },
        {
          post: {
            id: 6,
            title: '인지치료 평가 도구 추천',
            contentPreview: '인지치료 평가 도구 추천 드립니다...',
            therapyArea: 'COGNITIVE',
            ageGroup: 'UNSPECIFIED',
            viewCount: 8,
            authorNickname: '인지치료사B',
            createdAt: '2026-03-05T08:00:00Z',
          },
          myCommentPreview: 'K-WISC-V를 추천드립니다. 연령대에 적합하고 신뢰도가 높아요...',
          myCommentCreatedAt: '2026-03-05T09:00:00Z',
        },
      ],
      scrappedPosts: [
        {
          post: {
            id: 7,
            title: '효과적인 부모 상담 방법',
            contentPreview: '효과적인 부모 상담 방법을 소개합니다...',
            therapyArea: 'SPEECH',
            ageGroup: 'AGE_3_5',
            viewCount: 310,
            authorNickname: '치료사_10년차',
            createdAt: '2026-03-04T00:00:00Z',
          },
          scrappedAt: '2026-03-04T12:00:00Z',
        },
        {
          post: {
            id: 8,
            title: '자폐스펙트럼 아동 사회성 증진 프로그램',
            contentPreview: '자폐스펙트럼 아동 사회성 증진 프로그램 소개...',
            therapyArea: 'PLAY',
            ageGroup: 'AGE_6_12',
            viewCount: 220,
            authorNickname: '작업치료사_7년차',
            createdAt: '2026-03-02T00:00:00Z',
          },
          scrappedAt: '2026-03-02T15:00:00Z',
        },
      ],
    }),
  ),

  // Scrap
  http.post(`${API}/posts/:postId/scrap`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  http.delete(`${API}/posts/:postId/scrap`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Reactions
  http.put(`${API}/posts/:postId/reaction`, () =>
    HttpResponse.json({ success: true, data: { reactionType: 'LIKE' } }),
  ),

  http.delete(
    `${API}/posts/:postId/reaction`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
