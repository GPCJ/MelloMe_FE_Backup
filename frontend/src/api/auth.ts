import axiosInstance from './axiosInstance'
import type { AuthResponse } from '../types/auth'

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await axiosInstance.post('/auth/login', { email, password })
  return data
}

export async function signup(email: string, password: string, nickname: string): Promise<AuthResponse> {
  const { data } = await axiosInstance.post('/auth/signup', { email, password, nickname })
  return data
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const { data } = await axiosInstance.post('/auth/oauth/google', { idToken })
  return data
}
