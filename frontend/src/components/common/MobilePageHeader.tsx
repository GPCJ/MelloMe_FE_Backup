import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobilePageHeaderProps {
  title: string; // "게시글", "댓글 달기", "답글 달기"
  backTo: string; // 뒤로가기 경로
}

export default function MobilePageHeader({
  title,
  backTo,
}: MobilePageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(backTo)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-gray-900">{title}</h1>
      </div>
      {/* TODO: MVP 이후 케밥 메뉴 기능 추가 (신고, 차단 등) */}
      <button className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
        <MoreVertical size={20} />
      </button>
    </div>
  );
}
