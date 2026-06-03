import { create } from 'zustand';

interface MessageComposeState {
  open: boolean;
  // 모달이 열릴 때 누구에게 보낼지. 닫히면 null로 비워 다음 진입에 잔상이 남지 않게 한다.
  receiverId: number | null;
  receiverNickname: string | null;
  // 드롭다운의 "쪽지"에서 호출. 받는 사람을 담으면서 모달을 연다.
  openCompose: (receiver: { id: number; nickname: string }) => void;
  // 모달 자신이 닫을 때. 받는 사람 정보도 함께 비운다.
  closeCompose: () => void;
}

// PC 쪽지 작성 모달 전역 상태. PostDetailPage/CommentCard 등 여러 진입점이 동일한 모달을 토글.
// 모바일은 /messages/new?to=:id 라우트로 navigate하므로 이 store와 무관(usePostWriteModalStore 패턴 동일).
export const useMessageComposeStore = create<MessageComposeState>((set) => ({
  open: false,
  receiverId: null,
  receiverNickname: null,
  openCompose: (receiver) =>
    set({ open: true, receiverId: receiver.id, receiverNickname: receiver.nickname }),
  closeCompose: () => set({ open: false, receiverId: null, receiverNickname: null }),
}));
