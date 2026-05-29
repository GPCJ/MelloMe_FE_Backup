interface WriteTypeToggleProps {
  mode: 'post' | 'concern';
  onChange: (m: 'post' | 'concern') => void;
}

export default function WriteTypeToggle({ mode, onChange }: WriteTypeToggleProps) {
  return (
    <div
      role="group"
      aria-label="작성 타입"
      className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs"
    >
      <button
        type="button"
        aria-pressed={mode === 'post'}
        onClick={() => onChange('post')}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          mode === 'post'
            ? 'bg-white shadow-sm font-semibold text-gray-900'
            : 'text-gray-500'
        }`}
      >
        일반 글
      </button>
      <button
        type="button"
        aria-pressed={mode === 'concern'}
        onClick={() => onChange('concern')}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          mode === 'concern'
            ? 'bg-white shadow-sm font-semibold text-gray-900'
            : 'text-gray-500'
        }`}
      >
        고민 카드
      </button>
    </div>
  );
}
