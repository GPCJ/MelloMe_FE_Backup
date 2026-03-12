export type UserRole = 'USER' | 'THERAPIST' | 'ADMIN'

export interface MeResponse {
  id: number
  email: string
  nickname: string
  profileImageUrl: string | null
  role: UserRole
  canAccessCommunity: boolean
  therapistVerification: {
    id: number
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: string
    reviewedAt: string | null
    rejectReason: string | null
  } | null
}

export interface Tokens {
  accessToken: string
  refreshToken: string
  accessTokenExpiresInSec?: number
  refreshTokenExpiresInSec?: number
}

export interface AuthResponse {
  isNewUser: boolean
  user: MeResponse
  tokens: Tokens
}
