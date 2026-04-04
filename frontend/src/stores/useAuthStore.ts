import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MeResponse, Tokens } from '../types/auth';

interface AuthState {
  user: MeResponse | null;
  tokens: Tokens | null;
  setTokens: (tokens: Tokens) => void;
  setUser: (user: MeResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  // persist는 localstrage 저장을 수월하게 해주는 zustand 미들웨이
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null, tokens: null }),
    }),
    { name: 'auth-storage' },
  ),
);
