export type UserRole = 'USER' | 'THERAPIST' | 'ADMIN';

export interface MeResponse {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  role: UserRole;
  canAccessCommunity?: boolean;
  communityAccessLevel?: string;
  therapistVerification?: TherapistVerificationSummary | null;
}

export interface Tokens {
  accessToken: string;
  accessTokenExpiresInSec?: number;
}

export type TherapistVerificationStatus = 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TherapistVerificationSummary {
  status: TherapistVerificationStatus;
  requestedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface LoginResponse {
  user: MeResponse;
  tokens: Tokens;
}

export interface SignupResponse {
  id: number;
  email: string;
  nickname: string;
  accessToken: string;
  role: UserRole;
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
