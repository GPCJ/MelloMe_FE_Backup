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
