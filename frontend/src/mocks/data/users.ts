// 테스트 계정 + 토큰 mock 데이터

export const mockTokens = {
  accessToken: 'mock-access-token',
  accessTokenExpiresInSec: 3600,
};

export const testAccounts: Record<
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
    nickname: '일반회원_테스트',
  },
  'testTherapist@test.com': {
    id: 1,
    role: 'THERAPIST',
    nickname: '인증치료사_테스트',
  },
  'admin@test.com': {
    id: 99,
    role: 'ADMIN',
    nickname: '관리자_테스트',
  },
};
