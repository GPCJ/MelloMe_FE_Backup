import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';

interface MobileFixedBottomProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 모바일 하단 고정 컨테이너.
 * - 모든 UI 요소 위에 표시 (z-[9999])
 * - 키보드가 올라오면 키보드 바로 위에 위치
 * - 페이지 콘텐츠는 밀리지 않음
 */
export default function MobileFixedBottom({
  children,
  className = '',
}: MobileFixedBottomProps) {
  const keyboardHeight = useKeyboardHeight();

  return (
    <div
      className={`fixed left-0 right-0 z-[9999] bg-white border-t border-gray-200 px-4 py-3 ${className}`}
      style={{ bottom: keyboardHeight }}
    >
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
