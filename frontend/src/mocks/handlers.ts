import { http, HttpResponse } from 'msw';

const API = import.meta.env.VITE_API_BASE_URL;

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  accessTokenExpiresInSec: 3600,
  refreshTokenExpiresInSec: 604800,
};

const testAccounts: Record<string, { role: string; canAccessCommunity: boolean; nickname: string }> = {
  'testUser@test.com': { role: 'USER', canAccessCommunity: false, nickname: '테스트유저' },
  'testTherapist@test.com': { role: 'THERAPIST', canAccessCommunity: true, nickname: '테스트치료사' },
  'admin@test.com': { role: 'ADMIN', canAccessCommunity: true, nickname: '관리자' },
};

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
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
      { code: 'AUTH_401', message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
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
];
