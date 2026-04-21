// 인증 핸들러 — 회원가입, 로그인
import { http, HttpResponse } from 'msw';
import { testAccounts, mockTokens } from '../data/users';
import { setCurrentUserEmail, signedUpEmails } from '../state';

const API = import.meta.env.VITE_API_BASE_URL;

export const authHandlers = [
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
    setCurrentUserEmail(body.email);
    const account = testAccounts[body.email];
    return HttpResponse.json(
      {
        success: true,
        data: {
          id: account.id,
          email: body.email,
          nickname: account.nickname,
          accessToken: mockTokens.accessToken,
          role: account.role,
        },
      },
      { status: 201 },
    );
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const account = testAccounts[body.email];
    if (account && (signedUpEmails.has(body.email) || body.password === '1111')) {
      setCurrentUserEmail(body.email);
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
];
