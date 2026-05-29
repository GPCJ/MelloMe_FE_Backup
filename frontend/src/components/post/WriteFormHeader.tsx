import { ArrowLeft, PencilLine } from 'lucide-react';
import WriteTypeToggle from './WriteTypeToggle';

interface WriteFormHeaderProps {
  onClose: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  mode: 'post' | 'concern';
  onModeChange: (m: 'post' | 'concern') => void;
}

// PostWriteForm/ConcernForm 헤더 공통 — ← 토글 ✏️ 3분할.
// aria-disabled 채택: disabled로 click을 막지 않고 호출자(폼)가 누락 필드 안내 등 사용자 피드백을 제공할 수 있게.
export default function WriteFormHeader({
  onClose,
  onSubmit,
  canSubmit,
  mode,
  onModeChange,
}: WriteFormHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="p-1 -ml-1 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>
      <WriteTypeToggle mode={mode} onChange={onModeChange} />
      <button
        type="button"
        onClick={onSubmit}
        aria-disabled={!canSubmit}
        aria-label="게시하기"
        className="p-1 -mr-1 text-gray-900 hover:text-black transition-colors aria-disabled:text-gray-300 aria-disabled:cursor-not-allowed"
      >
        <PencilLine size={20} />
      </button>
    </header>
  );
}
