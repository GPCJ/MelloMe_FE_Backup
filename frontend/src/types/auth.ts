export type UserRole = 'USER' | 'THERAPIST' | 'ADMIN';

export interface MeResponse {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  role: UserRole;
  canAccessCommunity: boolean;
  therapistVerification: {
    status: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
  };
}

export interface Tokens {
  accessToken: string;
  accessTokenExpiresInSec?: number;
}

export interface AuthResponse {
  isNewUser: boolean;
  user: MeResponse;
  tokens: Tokens;
}

export interface UserSummary {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
}
