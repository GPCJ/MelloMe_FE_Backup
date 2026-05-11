import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: ReactNode;
  backTo?: string;
  rightAction?: ReactNode;
  leftAction?: ReactNode;
}

export default function PageHeader({ title, backTo, rightAction, leftAction }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-14 items-center justify-between bg-white">
      <div className="flex items-center">
        {leftAction
          ? leftAction
          : backTo && (
              <button
                onClick={() => navigate(backTo)}
                className="flex h-full items-center justify-center px-4 text-gray-900 hover:bg-gray-50 transition-colors"
                aria-label="뒤로 가기"
              >
                <ArrowLeft size={24} />
              </button>
            )}
      </div>
      <div className="flex items-center gap-4 px-4">{rightAction}</div>
      {/* 시안: 좌/우 컨테이너 폭과 무관하게 헤더 정중앙 정렬. pointer-events-none으로 우측 버튼 클릭 차단 방지 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {typeof title === 'string' ? (
          <h1 className="whitespace-nowrap text-[18px] font-medium text-gray-900">{title}</h1>
        ) : (
          title
        )}
      </div>
    </div>
  );
}
