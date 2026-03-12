import { create } from 'zustand'
import type { MeResponse, Tokens } from '../types/auth'

interface AuthState {
  user: MeResponse | null
  tokens: Tokens | null
  setAuth: (user: MeResponse, tokens: Tokens) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  setAuth: (user, tokens) => set({ user, tokens }),
  clearAuth: () => set({ user: null, tokens: null }),
}))
