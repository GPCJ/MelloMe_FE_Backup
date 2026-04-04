import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MeResponse, Tokens } from '../types/auth';

interface AuthState {
  user: MeResponse | null;
  tokens: Tokens | null;
  setAuth: (user: MeResponse, tokens: Tokens) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  // persist는 localstrage 저장을 수월하게 해주는 zustand 미들웨이
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (user, tokens) => set({ user, tokens }),
      clearAuth: () => set({ user: null, tokens: null }),
    }),
    { name: 'auth-storage' },
  ),
);
