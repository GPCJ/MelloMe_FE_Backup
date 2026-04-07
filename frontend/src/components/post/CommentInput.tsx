interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
}

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  submitting,
  placeholder = '댓글을 입력하세요...',
  buttonText = '댓글 작성',
  autoFocus,
}: CommentInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
      />
      <button
        type="submit"
        disabled={submitting || !value.trim()}
        className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        {buttonText}
      </button>
    </form>
  );
}
