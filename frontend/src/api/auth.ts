import axiosInstance from './axiosInstance'
import type { AuthResponse, MeResponse } from '../types/auth'

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await axiosInstance.post('/auth/login', { email, password })
  return data
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  // TODO: 백엔드에서 nickname 필수 필드 제거 후 삭제할 것
  const nickname = `user_${Math.random().toString(36).slice(2, 8)}`;
  const { data } = await axiosInstance.post('/auth/signup', { email, password, nickname })
  return data
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await axiosInstance.get('/me')
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

