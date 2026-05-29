import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PostWriteForm from './PostWriteForm';
import ConcernForm from './ConcernForm';
import { usePostWriteModalStore } from '../../stores/postWriteModalStore';

export default function PostWriteModal() {
  const open = usePostWriteModalStore((s) => s.open);
  const closeModal = usePostWriteModalStore((s) => s.closeModal);
  const qc = useQueryClient();
  const location = useLocation();
  const [mode, setMode] = useState<'post' | 'concern'>('post');

  // 모달이 닫힐 때마다 모드를 기본 'post'로 리셋 — 사용자 액션(handleClose)뿐 아니라
  // 외부 closeModal() 직접 호출(SideNav/auth logout 등 미래 진입점)도 일관 커버.
  useEffect(() => {
    if (!open) setMode('post');
  }, [open]);

  // 라우트 변경 시 모달 자동 close — PC 모달은 zustand store에 살아있어 navigate 만으로는 닫히지 않음.
  // (USER 토스트의 "치료사 인증하러 가기" → /therapist-verifications 이동 시 모달 잔존 케이스 해소)
  useEffect(() => {
    closeModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
        {/* aria-labelledby anchor — 시각적으로는 숨김(sr-only), 스크린리더에서 dialog 이름 announce용. */}
        <h2 id="post-write-modal-title" className="sr-only">
          {mode === 'post' ? '새 시그널 작성' : '고민 카드 작성'}
        </h2>
        {mode === 'post' ? (
          <PostWriteForm
            variant="modal"
            onClose={closeModal}
            onSuccess={handleSuccess}
            mode={mode}
            onModeChange={setMode}
          />
        ) : (
          <ConcernForm
            variant="modal"
            onClose={closeModal}
            onSuccess={handleSuccess}
            mode={mode}
            onModeChange={setMode}
          />
        )}
      </div>
    </div>
  );
}
