import axiosInstance from './axiosInstance'
import type { LoginResponse, SignupResponse, MeResponse, TherapistVerificationDetail } from '../types/auth'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await axiosInstance.post('/auth/login', { email, password })
  return data
}

export async function signup(
  email: string,
  password: string,
  termsAgreed: boolean,
  privacyPolicyAgreed: boolean,
): Promise<SignupResponse> {
  const { data } = await axiosInstance.post('/auth/signup', {
    email,
    password,
    agreements: [
      { type: 'SERVICE_TERMS', version: 'v1.0', agreed: termsAgreed },
      { type: 'PRIVACY_POLICY', version: 'v1.0', agreed: privacyPolicyAgreed },
    ],
  })
  return data
}

export async function logout(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

export async function deleteAccount(): Promise<void> {
  await axiosInstance.delete('/me')
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await axiosInstance.get('/me')
  return data
}

export async function getMyVerification(): Promise<TherapistVerificationDetail> {
  const { data } = await axiosInstance.get('/therapist-verifications/me')
  return data
}

// PATCH /me — 닉네임 수정용. profileImageUrl은 400 방지를 위해 스토어 값 그대로 전달 (임시 대응, #이슈 참고)
export async function updateMyProfile(
  nickname: string,
  profileImageUrl: string | null,
): Promise<MeResponse> {
  const { data } = await axiosInstance.patch('/me', { nickname, profileImageUrl })
  return data
}

// 프로필 이미지 업로드 — 응답의 profileImageUrl로 스토어 직접 갱신 (getMe() 재호출 대비 API 1회 절약)
export async function uploadProfileImage(file: File): Promise<{ profileImageUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await axiosInstance.post('/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function applyTherapistVerification(
  licenseCode: string,
  licenseImage: File,
): Promise<void> {
  const formData = new FormData()
  formData.append('licenseCode', licenseCode)
  formData.append('licenseImage', licenseImage)
  await axiosInstance.post('/therapist-verifications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

