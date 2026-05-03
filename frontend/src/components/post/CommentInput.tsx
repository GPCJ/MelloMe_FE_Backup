interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
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
  const isMobile = navigator.maxTouchPoints > 0;

  function handleKeyDown(e:React.KeyboardEvent<HTMLTextAreaElement>){
    if(e.key === 'Enter' && !e.shiftKey && !isMobile){
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex items-end gap-2">
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 px-4 py-2 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
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
