import { create } from 'zustand';

interface PostWriteModalState {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// PC 게시글 작성 모달 전역 상태. SideNav/PostListPage 등 여러 진입점이 동일한 모달을 토글.
// 모바일은 /posts/new 라우트로 navigate하므로 이 store와 무관.
export const usePostWriteModalStore = create<PostWriteModalState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
