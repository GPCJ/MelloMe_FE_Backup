import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginUser, MeResponse, Tokens } from '../types/auth';

interface AuthState {
  user: LoginUser | MeResponse | null;
  tokens: Tokens | null;

  /**
   * 회원가입 직후 리다이렉트 경로를 저장하는 필드.
   *
   * 왜 store에 있는가?
   * - SignupPage는 GuestRoute(비로그인 전용 가드) 안에 있다.
   * - signup 성공 → setUser()로 인증 상태가 되면 React가 즉시 리렌더한다.
   * - GuestRoute가 "로그인된 유저"를 감지하고 navigate('/welcome')보다 먼저
   *   기본 리다이렉트('/')를 실행해버린다. (race condition)
   * - location.state는 navigate()가 실행돼야 전달되므로, 리렌더가 먼저 일어나면
   *   state가 아직 없는 상태에서 GuestRoute가 평가된다.
   *
   * 해결: setUser() 호출 전에 Zustand store에 목적지를 먼저 저장해두면,
   * GuestRoute가 리렌더 시점에 이 값을 읽어서 올바른 경로로 보낼 수 있다.
   */
  pendingRedirect: string | null;

  setTokens: (tokens: Tokens) => void;
  setUser: (user: LoginUser | MeResponse) => void;
  setPendingRedirect: (path: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  // persist는 localstrage 저장을 수월하게 해주는 zustand 미들웨이
  persist(
    (set) => ({
      user: null,
      tokens: null,
      pendingRedirect: null,
      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      setPendingRedirect: (path) => set({ pendingRedirect: path }),
      clearAuth: () => set({ user: null, tokens: null, pendingRedirect: null }),
    }),
    { name: 'auth-storage' },
  ),
);
