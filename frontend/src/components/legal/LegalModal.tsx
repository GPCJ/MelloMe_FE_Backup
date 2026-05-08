import { useId, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  title: string; // "이용약관" 또는 "개인정보처리방침"
  children: ReactNode; // <TermsContent /> 또는 <PrivacyContent />
}

export function LegalModal({ open, onClose, title, children }: LegalModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  // createPortal이라는 함수의 반환값을 return함. createPortal함수의 파라미터는 첫번째: jsx, 두번째: 어느 DOM노드에 끼워 넣을지.
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      {/* 모달 박스 */}
      <div
        className="
            absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl bg-white flex flex-col shadow-xl
            sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
            sm:w-[calc(100%-32px)] sm:max-w-[600px] sm:max-h-[85vh] sm:rounded-2xl
          "
        onClick={(e) => e.stopPropagation()} // 모달 내부를 클릭 시에는 닫히지 않음
      >
        {/* 헤더 */}
        <div className="relative flex h-14 items-center justify-center py-4">
          <h2 id={titleId} className="text-lg font-medium text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 p-1 text-gray-700"
          >
            {' '}
            <X size={28} />
          </button>
        </div>
        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-4 py-2">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
