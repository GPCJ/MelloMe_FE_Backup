import { QueryClient } from '@tanstack/react-query';

// 모듈 싱글턴 — main.tsx의 Provider와 useAuthStore.clearAuth 양쪽에서 동일 인스턴스 참조.
// 로그아웃/계정 탈퇴/refresh 실패 시 캐시 격리를 위해 store가 직접 .clear()를 호출함.
export const queryClient = new QueryClient();
