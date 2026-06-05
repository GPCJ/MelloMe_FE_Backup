import { create } from 'zustand';

// 안읽은 쪽지 수 전용 store(push).
// 쪽지함 목록은 React Query(pull), 안읽음 카운트는 store(push)로 이원화한다 — 알림 시스템과 동일.
// useNotificationStore의 unreadCount 부분만 거울 복제.
interface MessageState {
  unreadCount: number;

  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
  clear: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  unreadCount: 0,

  // 초기/탭복귀 시 서버값으로 덮어쓰기(신뢰 소스).
  setUnreadCount: (count) => set({ unreadCount: count }),

  // SSE로 NEW_MESSAGE 도착 시 +1.
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  // 안읽은 쪽지 열람 성공 시 낙관적 -1(0 밑으로는 안 내려감).
  decrement: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  clear: () => set({ unreadCount: 0 }),
}));
