import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MeResponse, Tokens } from '../types/auth';
import { queryClient } from '../lib/queryClient';

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
      clearAuth: () => {
        set({ user: null, tokens: null });
        localStorage.removeItem('auth-storage');
        // 다른 사용자가 같은 브라우저 세션에서 재로그인할 때 이전 사용자의 RQ 캐시(feed/me/posts 등)가
        // 노출되지 않도록 모든 query 캐시를 비움. 로그아웃 버튼/계정 탈퇴/401 refresh 실패 모두 통과.
        queryClient.clear();
      },
    }),
    { name: 'auth-storage' },
  ),
);
