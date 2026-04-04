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

