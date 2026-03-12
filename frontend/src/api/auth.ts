import type { AuthResponse } from '../types/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? '요청에 실패했습니다.')
  return data as T
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<AuthResponse>(res)
}

export async function signup(email: string, password: string, nickname: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname }),
  })
  return handleResponse<AuthResponse>(res)
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/oauth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  return handleResponse<AuthResponse>(res)
}
