import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginUser, MeResponse, Tokens } from '../types/auth';

interface AuthState {
  user: LoginUser | MeResponse | null;
  tokens: Tokens | null;
  setTokens: (tokens: Tokens) => void;
  setUser: (user: LoginUser | MeResponse) => void;
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
      clearAuth: () => {
        console.log('[clearAuth] 호출됨');
        console.log('[clearAuth] localStorage BEFORE:', localStorage.getItem('auth-storage'));
        set({ user: null, tokens: null });
        localStorage.removeItem('auth-storage');
        console.log('[clearAuth] localStorage AFTER:', localStorage.getItem('auth-storage'));
      },
    }),
    { name: 'auth-storage' },
  ),
);
