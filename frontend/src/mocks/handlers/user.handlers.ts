// 유저 핸들러 — 내 정보 조회, 치료사 인증 요청
import { http, HttpResponse } from 'msw';
import { testAccounts } from '../data/users';
import { currentUserEmail } from '../state';

const API = import.meta.env.VITE_API_BASE_URL;

export const userHandlers = [
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
];
