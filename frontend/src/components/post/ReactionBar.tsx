import { Heart, Star, Lightbulb } from 'lucide-react';
import type { ReactionType } from '../../types/post';

// 라벨/아이콘은 디자이너 컨펌 전 임시 유지 (백엔드 명세 변경 2026-04-21).
// 라벨 텍스트는 화면에 표시하지 않고 aria-label 용도로만 사용 — 디자이너 결정: 카운트 0이면 아이콘만 표시.
const REACTIONS: {
  type: ReactionType;
  icon: typeof Heart;
  label: string;
}[] = [
  { type: 'LIKE', icon: Heart, label: '좋아요' },
  { type: 'CURIOUS', icon: Star, label: '궁금해요' },
  { type: 'USEFUL', icon: Lightbulb, label: '유용해요' },
];

interface ReactionBarProps {
  counts: Record<ReactionType, number>;
  myReactionType: ReactionType | null;
  onToggle: (type: ReactionType) => void;
  disabled?: boolean;
  size?: number;
}

export default function ReactionBar({
  counts,
  myReactionType,
  onToggle,
  disabled,
  size,
}: ReactionBarProps) {
  return (
    <div className="flex items-center gap-4">
      {REACTIONS.map(({ type, icon: Icon, label }) => {
        const isActive = myReactionType === type;
        const count = counts[type] ?? 0;

        return (
          <button
            key={type}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // 리액션을 눌렀는데 상세 페이지로 이동하는 현상을 막음
              onToggle(type);
            }}
            disabled={disabled}
            aria-label={label}
            className={`flex items-center gap-1 text-sm transition-colors ${
              isActive ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={size ?? 16} fill={isActive ? 'currentColor' : 'none'} />
            {count > 0 && <span className="text-xs">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
