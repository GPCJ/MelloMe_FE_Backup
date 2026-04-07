interface SimpleTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function SimpleTextEditor({
  content,
  onChange,
  placeholder = '내용을 입력해주세요',
  maxLength = 2000,
}: SimpleTextEditorProps) {
  return (
    <div className="flex flex-col gap-1">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={12}
        className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
      <p className="text-xs text-gray-400 text-right">
        {content.length}/{maxLength}
      </p>
    </div>
  );
}
