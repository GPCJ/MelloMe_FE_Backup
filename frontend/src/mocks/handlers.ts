import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_BASE_URL;

const mockPosts = [
  {
    id: 1,
    title: '',
    contentPreview: '감각통합 활동에 유용한 자료를 공유합니다. 최근 3~5세 아동에게 적용해본 감각놀이 프로그램인데, 촉각 방어가 있는 아이들에게 효과가 좋았어요.',
    content: '감각통합 활동에 유용한 자료를 공유합니다.\n\n최근 3~5세 아동에게 적용해본 감각놀이 프로그램인데, 촉각 방어가 있는 아이들에게 효과가 좋았어요.\n\n1. 밀가루 반죽 놀이 (10분)\n2. 물감 손바닥 찍기 (15분)\n3. 모래 상자 탐색 (20분)\n\n각 활동마다 아이의 반응을 관찰하고 기록해두면 좋습니다. 혹시 비슷한 프로그램 운영하시는 분 계시면 의견 부탁드려요!',
    therapyArea: 'OCCUPATIONAL',
    viewCount: 42,
    commentCount: 5,
    hasAttachment: true,
    isBlurred: false,
    authorId: 2,
    authorNickname: '김작업치료사',
    authorProfileImageUrl: null,
    authorVerificationStatus: 'APPROVED',
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-02T08:00:00Z',
    updatedAt: '2026-04-02T08:00:00Z',
  },
  {
    id: 2,
    title: '',
    contentPreview: '오늘 치료 세션에서 아이가 처음으로 두 단어 조합 문장을 말했어요! "엄마 줘" 라고 했는데 정말 감동이었습니다. 6개월째 꾸준히 모델링 하고 있었는데...',
    content: '오늘 치료 세션에서 아이가 처음으로 두 단어 조합 문장을 말했어요!\n\n"엄마 줘" 라고 했는데 정말 감동이었습니다.\n6개월째 꾸준히 모델링 하고 있었는데, 드디어 자발적 발화가 나왔네요.\n\n부모님도 같이 울으셨어요 ㅠㅠ\n이 직업 하면서 이런 순간이 정말 보람차요.\n\n혹시 두 단어 조합 이후 세 단어로 확장하는 효과적인 전략 있으실까요?',
    therapyArea: 'SPEECH',
    viewCount: 234,
    commentCount: 12,
    hasAttachment: false,
    isBlurred: false,
    authorId: 3,
    authorNickname: '언어치료사_민지',
    authorProfileImageUrl: null,
    authorVerificationStatus: 'APPROVED',
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-02T06:30:00Z',
    updatedAt: '2026-04-02T06:30:00Z',
  },
  {
    id: 3,
    title: '',
    contentPreview: '인증된 치료사만 볼 수 있는 케이스 스터디입니다. ADHD 진단을 받은 7세 아동의 인지행동치료 6개월 경과 보고...',
    content: '인증된 치료사만 볼 수 있는 케이스 스터디입니다.\n\nADHD 진단을 받은 7세 아동의 인지행동치료 6개월 경과 보고\n\n초기 평가:\n- 주의집중 시간: 3분\n- 과제 완수율: 20%\n\n6개월 후:\n- 주의집중 시간: 12분\n- 과제 완수율: 65%\n\n사용한 기법과 세션별 변화를 상세히 공유드립니다.',
    therapyArea: 'COGNITIVE',
    viewCount: 189,
    commentCount: 8,
    hasAttachment: true,
    isBlurred: true,
    authorId: 4,
    authorNickname: '인지치료사_수연',
    authorProfileImageUrl: null,
    authorVerificationStatus: 'APPROVED',
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-01T14:00:00Z',
    updatedAt: '2026-04-01T14:00:00Z',
  },
  {
    id: 4,
    title: '',
    contentPreview: '놀이치료에서 경계선 설정이 어려운 아이가 있는데, 선배 치료사분들 조언 부탁드려요. 5세 남아인데 세션 중에 치료실 밖으로 나가려고 하고...',
    content: '놀이치료에서 경계선 설정이 어려운 아이가 있는데, 선배 치료사분들 조언 부탁드려요.\n\n5세 남아인데 세션 중에 치료실 밖으로 나가려고 하고, 장난감을 던지는 행동이 반복돼요.\n\n제가 시도해본 것들:\n- 타이머 활용 → 효과 미미\n- 시각적 규칙판 → 처음엔 관심 보이다가 곧 무시\n- 선택지 제공 → 때때로 효과 있음\n\n비슷한 경험 있으신 분들 어떻게 대처하셨는지 궁금합니다.',
    therapyArea: 'PLAY',
    viewCount: 156,
    commentCount: 15,
    hasAttachment: false,
    isBlurred: false,
    authorId: 5,
    authorNickname: '놀이치료사_하은',
    authorProfileImageUrl: null,
    authorVerificationStatus: 'APPROVED',
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 5,
    title: '',
    contentPreview: '치료사 2년차인데 번아웃이 왔어요. 하루에 세션을 6~7개씩 하다 보니 체력적으로도 정신적으로도 지치네요...',
    content: '치료사 2년차인데 번아웃이 왔어요.\n\n하루에 세션을 6~7개씩 하다 보니 체력적으로도 정신적으로도 지치네요.\n특히 보호자 상담이 힘들어요. 진전이 느린 아이의 부모님이 조급해하시면 저도 같이 불안해지고...\n\n선배 치료사분들은 어떻게 마인드 관리를 하시나요?\n번아웃 극복 경험이나 자기관리 팁 공유해주시면 감사하겠습니다.',
    therapyArea: 'UNSPECIFIED',
    viewCount: 312,
    commentCount: 23,
    hasAttachment: false,
    isBlurred: false,
    authorId: 6,
    authorNickname: '새내기치료사',
    authorProfileImageUrl: null,
    authorVerificationStatus: 'NOT_REQUESTED',
    canEdit: false,
    canDelete: false,
    createdAt: '2026-03-31T22:00:00Z',
    updatedAt: '2026-03-31T22:00:00Z',
  },
  {
    id: 6,
    title: '',
    contentPreview: '인증 치료사 전용 자료입니다. 작업치료 평가 도구 비교표 (COPM, BOT-2, PDMS-2) 정리했습니다...',
    content: '인증 치료사 전용 자료입니다.\n\n작업치료 평가 도구 비교표 정리했습니다.\n\n| 평가도구 | 대상연령 | 소요시간 | 주요영역 |\n|---------|---------|---------|--------|\n| COPM | 전연령 | 20-30분 | 작업수행 |\n| BOT-2 | 4-21세 | 45-60분 | 운동능력 |\n| PDMS-2 | 0-5세 | 45-60분 | 운동발달 |\n\n각 도구별 장단점과 사용 팁은 첨부파일을 참고해주세요.',
    therapyArea: 'OCCUPATIONAL',
    viewCount: 98,
    commentCount: 3,
    hasAttachment: true,
    isBlurred: true,
    authorId: 7,
    authorNickname: '작업치료사_10년차',
    authorProfileImageUrl: null,
    authorVerificationStatus: 'APPROVED',
    canEdit: false,
    canDelete: false,
    createdAt: '2026-03-31T15:00:00Z',
    updatedAt: '2026-03-31T15:00:00Z',
  },
  {
    id: 7,
    title: '',
    contentPreview: '치료사 면접 준비 중인데 경험 공유드려요. 저는 작년에 3군데 면접 봤는데 공통적으로 나온 질문들 정리했습니다...',
    content: '치료사 면접 준비 중인데 경험 공유드려요.\n\n저는 작년에 3군데 면접 봤는데 공통적으로 나온 질문들 정리했습니다.\n\n1. 왜 이 분야를 선택했나요?\n2. 어려운 케이스를 어떻게 대처했나요?\n3. 보호자와의 갈등 경험?\n4. 팀워크 경험?\n5. 자기계발 계획?\n\n면접 준비하시는 분들 화이팅!',
    therapyArea: 'UNSPECIFIED',
    viewCount: 445,
    commentCount: 31,
    hasAttachment: false,
    isBlurred: false,
    authorId: 8,
    authorNickname: '치료사_준비생',
    authorProfileImageUrl: null,
    authorVerificationStatus: 'PENDING',
    canEdit: false,
    canDelete: false,
    createdAt: '2026-03-30T09:00:00Z',
    updatedAt: '2026-03-30T09:00:00Z',
  },
];

// 게시글별 리액션 데이터
const mockReactions: Record<number, { empathyCount: number; appreciateCount: number; helpfulCount: number; myReactionType: string | null }> = {
  1: { empathyCount: 5, appreciateCount: 12, helpfulCount: 8, myReactionType: null },
  2: { empathyCount: 45, appreciateCount: 3, helpfulCount: 2, myReactionType: 'EMPATHY' },
  3: { empathyCount: 8, appreciateCount: 15, helpfulCount: 22, myReactionType: null },
  4: { empathyCount: 23, appreciateCount: 5, helpfulCount: 18, myReactionType: 'HELPFUL' },
  5: { empathyCount: 67, appreciateCount: 12, helpfulCount: 4, myReactionType: null },
  6: { empathyCount: 3, appreciateCount: 8, helpfulCount: 31, myReactionType: null },
  7: { empathyCount: 34, appreciateCount: 22, helpfulCount: 15, myReactionType: 'APPRECIATE' },
};

const mockComments = [
  {
    id: 1,
    postId: 1,
    parentCommentId: null,
    authorId: 3,
    authorNickname: '언어치료사_민지',
    authorRole: 'THERAPIST',
    content: '좋은 자료 감사합니다! 저도 비슷한 프로그램을 운영하고 있는데, 물감 놀이 시 아이들이 촉각 자극에 점점 익숙해지는 게 눈에 보여요.',
    deleted: false,
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-02T09:00:00Z',
    updatedAt: '2026-04-02T09:00:00Z',
    replies: [],
  },
  {
    id: 2,
    postId: 1,
    parentCommentId: 1,
    authorId: 2,
    authorNickname: '김작업치료사',
    authorRole: 'THERAPIST',
    content: '맞아요! 특히 모래 상자 활동은 처음에 거부하던 아이도 3~4회 반복하면 자발적으로 손을 넣더라고요.',
    deleted: false,
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-02T09:30:00Z',
    updatedAt: '2026-04-02T09:30:00Z',
    replies: [],
  },
  {
    id: 3,
    postId: 1,
    parentCommentId: null,
    authorId: 5,
    authorNickname: '놀이치료사_하은',
    authorRole: 'THERAPIST',
    content: '혹시 촉각 방어가 심한 아이에게 밀가루 반죽을 바로 제시하시나요? 저는 먼저 마른 밀가루부터 시작하는 편인데 순서가 궁금합니다.',
    deleted: false,
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-02T10:00:00Z',
    updatedAt: '2026-04-02T10:00:00Z',
    replies: [],
  },
  {
    id: 4,
    postId: 2,
    parentCommentId: null,
    authorId: 4,
    authorNickname: '인지치료사_수연',
    authorRole: 'THERAPIST',
    content: '축하드려요!! 정말 감동적인 순간이었겠네요. 꾸준한 모델링의 힘을 다시 느낍니다.',
    deleted: false,
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-02T07:00:00Z',
    updatedAt: '2026-04-02T07:00:00Z',
    replies: [],
  },
  {
    id: 5,
    postId: 4,
    parentCommentId: null,
    authorId: 7,
    authorNickname: '작업치료사_10년차',
    authorRole: 'THERAPIST',
    content: '저도 비슷한 케이스가 있었는데, "먼저 ~ 하고, 그 다음 ~ 하자" 식의 First-Then 보드가 효과적이었어요. 시각적 지원이 타이머보다 더 잘 먹히는 아이들이 있더라고요.',
    deleted: false,
    canEdit: false,
    canDelete: false,
    createdAt: '2026-04-01T11:00:00Z',
    updatedAt: '2026-04-01T11:00:00Z',
    replies: [],
  },
];

const mockTokens = {
  accessToken: 'mock-access-token',
  accessTokenExpiresInSec: 3600,
};

// 현재 로그인된 사용자 이메일 추적 (GET /me 응답용)
let currentUserEmail: string | null = null;

// 회원가입으로 등록된 이메일 추적 (비밀번호 체크 스킵용)
const signedUpEmails = new Set<string>();

const testAccounts: Record<
  string,
  {
    id: number;
    role: string;
    nickname: string;
  }
> = {
  'testUser@test.com': {
    id: 10,
    role: 'USER',
    nickname: '새내기치료사',
  },
  'testTherapist@test.com': {
    id: 1,
    role: 'THERAPIST',
    nickname: '테스트치료사',
  },
  'admin@test.com': {
    id: 99,
    role: 'ADMIN',
    nickname: '관리자',
  },
};

export const handlers = [
  http.post(`${API}/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; nickname?: string };
    if (testAccounts[body.email]) {
      return HttpResponse.json(
        { code: 'AUTH_409', message: '이미 가입된 이메일입니다.' },
        { status: 409 },
      );
    }
    const nickname = body.nickname || `치료사${Math.random().toString(36).slice(2, 8)}`;
    testAccounts[body.email] = {
      id: Date.now(),
      role: 'USER',
      nickname,
    };
    signedUpEmails.add(body.email);
    currentUserEmail = body.email;
    const account = testAccounts[body.email];
    return HttpResponse.json({
      success: true,
      data: {
        id: account.id,
        email: body.email,
        nickname: account.nickname,
        accessToken: mockTokens.accessToken,
        role: account.role,
      },
    }, { status: 201 });
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const account = testAccounts[body.email];
    if (account && (signedUpEmails.has(body.email) || body.password === '1111')) {
      currentUserEmail = body.email;
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: account.id,
            email: body.email,
            nickname: account.nickname,
            profileImageUrl: null,
            role: account.role,
            canAccessCommunity: account.role !== 'USER',
            therapistVerification: {
              status: 'NOT_REQUESTED',
              requestedAt: null,
              reviewedAt: null,
              rejectionReason: null,
            },
          },
          tokens: {
            accessToken: mockTokens.accessToken,
            accessTokenExpiresInSec: mockTokens.accessTokenExpiresInSec,
          },
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

  http.get(`${API}/meta/options`, () =>
    HttpResponse.json({
      boardTypes: ['therapy_board', 'document_board', 'anonymous_board'],
      therapyAreas: ['UNSPECIFIED', 'OCCUPATIONAL', 'SPEECH', 'COGNITIVE', 'PLAY'],
      reactionTypes: ['EMPATHY', 'APPRECIATE', 'HELPFUL'],
    }),
  ),

  http.get(`${API}/me`, () => {
    if (!currentUserEmail || !testAccounts[currentUserEmail]) {
      return HttpResponse.json(
        { code: 'AUTH_401', message: 'Unauthorized' },
        { status: 401 },
      );
    }
    const account = testAccounts[currentUserEmail];
    return HttpResponse.json({
      success: true,
      data: {
        id: account.id,
        email: currentUserEmail,
        nickname: account.nickname,
        profileImageUrl: null,
        role: account.role,
      },
    });
  }),

  http.post(`${API}/therapist-verifications`, () => {
    if (currentUserEmail && testAccounts[currentUserEmail]) {
      testAccounts[currentUserEmail].role = 'THERAPIST';
    }
    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  // Posts
  http.get(`${API}/posts`, ({ request }) => {
    const url = new URL(request.url);
    const therapyArea = url.searchParams.get('therapyArea');
    const filtered = therapyArea
      ? mockPosts.filter((p) => p.therapyArea === therapyArea)
      : mockPosts;

    // 현재 로그인 유저 기준으로 canEdit/canDelete 설정
    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const posts = filtered.map((p) => ({
      id: p.id,
      title: p.title,
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
        title: post.title,
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
      title: (body.title as string) || '',
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

  // Attachments
  http.post(`${API}/posts/:postId/attachments`, async ({ params, request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return HttpResponse.json({ code: 'BAD_REQUEST', message: '파일이 없습니다.' }, { status: 400 });
    }

    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (post) post.hasAttachment = true;

    const attachment = {
      id: Date.now(),
      originalFilename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      extension: file.name.split('.').pop() ?? '',
      downloadUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true, data: attachment }, { status: 201 });
  }),

  http.delete(
    `${API}/posts/:postId/attachments/:attachmentId`,
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

  // Reactions
  http.get(`${API}/posts/:postId/reaction`, ({ params }) => {
    const postId = Number(params.postId);
    const reaction = mockReactions[postId] ?? {
      empathyCount: 0,
      appreciateCount: 0,
      helpfulCount: 0,
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
      mockReactions[postId] = { empathyCount: 0, appreciateCount: 0, helpfulCount: 0, myReactionType: null };
    }
    const r = mockReactions[postId];
    const type = body.reactionType;

    if (r.myReactionType === type) {
      // 토글 해제
      const key = type === 'EMPATHY' ? 'empathyCount' : type === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount';
      r[key] = Math.max(0, r[key] - 1);
      r.myReactionType = null;
    } else {
      // 이전 리액션 해제
      if (r.myReactionType) {
        const prevKey = r.myReactionType === 'EMPATHY' ? 'empathyCount' : r.myReactionType === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount';
        r[prevKey] = Math.max(0, r[prevKey] - 1);
      }
      // 새 리액션 추가
      const newKey = type === 'EMPATHY' ? 'empathyCount' : type === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount';
      r[newKey] = r[newKey] + 1;
      r.myReactionType = type;
    }

    return HttpResponse.json({ success: true, data: { postId, ...r } });
  }),

  // Profile — My Posts
  http.get(`${API}/me/posts`, () => {
    const currentAccount = currentUserEmail ? testAccounts[currentUserEmail] : null;
    const myPosts = mockPosts
      .filter((p) => p.authorId === currentAccount?.id)
      .map((p) => ({
        id: p.id,
        title: p.title,
        contentPreview: p.contentPreview,
        authorNickname: p.authorNickname,
        authorProfileImageUrl: p.authorProfileImageUrl,
        authorVerificationStatus: p.authorVerificationStatus,
        therapyArea: p.therapyArea,
        viewCount: p.viewCount,
        commentCount: p.commentCount,
        hasAttachment: p.hasAttachment,
        isBlurred: false,
        createdAt: p.createdAt,
      }));
    return HttpResponse.json(myPosts);
  }),

  // Profile — Activity (commented + scrapped)
  http.get(`${API}/me/activity`, () =>
    HttpResponse.json({
      commentedPosts: [
        {
          post: {
            id: 4,
            title: '',
            contentPreview: '놀이치료에서 경계선 설정이 어려운 아이가 있는데...',
            therapyArea: 'PLAY',
            viewCount: 156,
            commentCount: 15,
            hasAttachment: false,
            isBlurred: false,
            authorNickname: '놀이치료사_하은',
            authorProfileImageUrl: null,
            authorVerificationStatus: 'APPROVED',
            createdAt: '2026-04-01T10:00:00Z',
          },
          myCommentPreview: '저도 비슷한 경험이 있어요. First-Then 보드가 효과적이었습니다.',
          myCommentCreatedAt: '2026-04-01T11:30:00Z',
        },
        {
          post: {
            id: 5,
            title: '',
            contentPreview: '치료사 2년차인데 번아웃이 왔어요...',
            therapyArea: 'UNSPECIFIED',
            viewCount: 312,
            commentCount: 23,
            hasAttachment: false,
            isBlurred: false,
            authorNickname: '새내기치료사',
            authorProfileImageUrl: null,
            authorVerificationStatus: 'NOT_REQUESTED',
            createdAt: '2026-03-31T22:00:00Z',
          },
          myCommentPreview: '힘내세요! 저도 3년차 때 가장 힘들었는데, 동료 치료사들과 정기적인 케이스 컨퍼런스를 시작하면서 많이 나아졌어요.',
          myCommentCreatedAt: '2026-04-01T08:00:00Z',
        },
      ],
      scrappedPosts: [
        {
          post: {
            id: 1,
            title: '',
            contentPreview: '감각통합 활동에 유용한 자료를 공유합니다...',
            therapyArea: 'OCCUPATIONAL',
            viewCount: 42,
            commentCount: 5,
            hasAttachment: true,
            isBlurred: false,
            authorNickname: '김작업치료사',
            authorProfileImageUrl: null,
            authorVerificationStatus: 'APPROVED',
            createdAt: '2026-04-02T08:00:00Z',
          },
          scrappedAt: '2026-04-02T09:00:00Z',
        },
        {
          post: {
            id: 2,
            title: '',
            contentPreview: '오늘 치료 세션에서 아이가 처음으로 두 단어 조합 문장을 말했어요!...',
            therapyArea: 'SPEECH',
            viewCount: 234,
            commentCount: 12,
            hasAttachment: false,
            isBlurred: false,
            authorNickname: '언어치료사_민지',
            authorProfileImageUrl: null,
            authorVerificationStatus: 'APPROVED',
            createdAt: '2026-04-02T06:30:00Z',
          },
          scrappedAt: '2026-04-02T07:30:00Z',
        },
      ],
    }),
  ),

  // Scrap
  http.post(
    `${API}/posts/:postId/scrap`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.delete(
    `${API}/posts/:postId/scrap`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
