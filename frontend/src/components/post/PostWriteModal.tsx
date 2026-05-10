import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PostWriteForm from './PostWriteForm';
import { usePostWriteModalStore } from '../../stores/postWriteModalStore';

export default function PostWriteModal() {
  const open = usePostWriteModalStore((s) => s.open);
  const closeModal = usePostWriteModalStore((s) => s.closeModal);
  const qc = useQueryClient();

  // ESC로 닫기 + body 스크롤 잠금 (모달 열려있는 동안만).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, closeModal]);

  if (!open) return null;

  function handleSuccess() {
    // 새 글이 피드 상단에 보이도록 무한피드/페이지피드 모두 invalidate.
    qc.invalidateQueries({ queryKey: ['feed'] });
    closeModal();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      // mousedown 기준으로 닫기 — 모달 안에서 시작한 드래그가 배경에서 끝나도 click 인식되어
      // 닫히는 문제(예: 칩 가로 드래그) 방지. 배경에서 시작한 mousedown만 실제 닫기 의도로 처리.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-write-modal-title"
        className="w-full max-w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
      >
        <PostWriteForm variant="modal" onClose={closeModal} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
