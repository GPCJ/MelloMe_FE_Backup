// 유저 핸들러 — 내 정보 조회/수정, 프사 업로드, 치료사 인증 요청/조회
import { http, HttpResponse } from 'msw';
import { testAccounts } from '../data/users';
import { currentUserEmail } from '../state';

const API = import.meta.env.VITE_API_BASE_URL;

// MSW 내부 — 닉네임 외 프로필 이미지 URL을 트랙킹.
// testAccounts에는 이미지 필드가 없어서 별도 Map으로 관리 (실서버는 DB가 가짐).
const profileImageOverrides = new Map<string, string | null>();

export const userHandlers = [
  http.get(`${API}/me`, () => {
    if (!currentUserEmail || !testAccounts[currentUserEmail]) {
      return HttpResponse.json({ code: 'AUTH_401', message: 'Unauthorized' }, { status: 401 });
    }
    const account = testAccounts[currentUserEmail];
    return HttpResponse.json({
      success: true,
      data: {
        id: account.id,
        email: currentUserEmail,
        nickname: account.nickname,
        profileImageUrl: profileImageOverrides.get(currentUserEmail) ?? null,
        role: account.role,
      },
    });
  }),

  // 닉네임 수정 — ProfilePage `프로필 수정` 버튼 흐름 + GA4 profile_edited 트리거.
  http.patch(`${API}/me`, async ({ request }) => {
    if (!currentUserEmail || !testAccounts[currentUserEmail]) {
      return HttpResponse.json({ code: 'AUTH_401', message: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { nickname?: string };
    const account = testAccounts[currentUserEmail];
    if (typeof body.nickname === 'string' && body.nickname.trim()) {
      account.nickname = body.nickname.trim();
    }
    return HttpResponse.json({
      success: true,
      data: {
        id: account.id,
        email: currentUserEmail,
        nickname: account.nickname,
        profileImageUrl: profileImageOverrides.get(currentUserEmail) ?? null,
        role: account.role,
      },
    });
  }),

  // 프사 업로드 — multipart/form-data, 응답으로 새 URL 반환 + GA4 profile_edited 트리거.
  http.post(`${API}/me/profile-image`, async ({ request }) => {
    if (!currentUserEmail || !testAccounts[currentUserEmail]) {
      return HttpResponse.json({ code: 'AUTH_401', message: 'Unauthorized' }, { status: 401 });
    }
    // FormData를 형식상 읽어 검증 (실제 저장은 안 함 — mock URL 반환).
    await request.formData().catch(() => null);
    const mockUrl = `https://placehold.co/200x200?text=${encodeURIComponent(
      testAccounts[currentUserEmail].nickname,
    )}&t=${Date.now()}`;
    profileImageOverrides.set(currentUserEmail, mockUrl);
    return HttpResponse.json({
      success: true,
      data: { profileImageUrl: mockUrl },
    });
  }),

  // 치료사 인증 신청 — MVP 정책상 즉시 승인 (role=THERAPIST 즉시 부여).
  http.post(`${API}/therapist-verifications`, () => {
    if (currentUserEmail && testAccounts[currentUserEmail]) {
      testAccounts[currentUserEmail].role = 'THERAPIST';
    }
    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  // 내 인증 상세 조회 — TherapistVerificationPage 진입 + VerificationCompletePage 표시 흐름.
  // role이 THERAPIST/ADMIN이면 APPROVED 응답, 아니면 신청 이력 없음(404).
  // (실서버는 verification 레코드를 별도 관리하지만 MVP 즉시 승인이라 role 필드로 대체)
  http.get(`${API}/therapist-verifications/me`, () => {
    if (!currentUserEmail || !testAccounts[currentUserEmail]) {
      return HttpResponse.json({ code: 'AUTH_401', message: 'Unauthorized' }, { status: 401 });
    }
    const account = testAccounts[currentUserEmail];
    if (account.role !== 'THERAPIST' && account.role !== 'ADMIN') {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'No verification record' },
        { status: 404 },
      );
    }
    const now = new Date().toISOString();
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        userId: account.id,
        userEmail: currentUserEmail,
        userNickname: account.nickname,
        licenseCode: 'MOCK-LICENSE-0001',
        licenseImageOriginName: 'mock-license.jpg',
        licenseImageDownloadUrl: 'https://placehold.co/400x300?text=Mock+License',
        status: 'APPROVED',
        reviewedById: 99,
        reviewedByNickname: '관리자_테스트',
        reviewedAt: now,
        rejectReason: null,
        createdAt: now,
        updatedAt: now,
        demoted: false,
      },
    });
  }),
];
