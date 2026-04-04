export type UserRole = 'USER' | 'THERAPIST' | 'ADMIN';

export interface MeResponse {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  role: UserRole;
}

export interface Tokens {
  accessToken: string;
  accessTokenExpiresInSec?: number;
}

export interface LoginResponse {
  accessToken: string;
}

export interface TherapistVerificationDetail {
  id: number;
  userId: number;
  userEmail: string;
  userNickname: string;
  licenseCode: string;
  licenseImageOriginName: string;
  licenseImageDownloadUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedById: number | null;
  reviewedByNickname: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  demoted: boolean;
}

export interface UserSummary {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
}
