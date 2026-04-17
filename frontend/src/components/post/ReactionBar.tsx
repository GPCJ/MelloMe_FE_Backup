import { Heart, Star, Lightbulb } from 'lucide-react';
import type { ReactionType, PostReaction } from '../../types/post';

const REACTIONS: {
  type: ReactionType;
  icon: typeof Heart;
  label: string;
  countKey: keyof Pick<
    PostReaction,
    'empathyCount' | 'appreciateCount' | 'helpfulCount'
  >;
}[] = [
  { type: 'EMPATHY', icon: Heart, label: '공감', countKey: 'empathyCount' },
  {
    type: 'APPRECIATE',
    icon: Star,
    label: '감사',
    countKey: 'appreciateCount',
  },
  { type: 'HELPFUL', icon: Lightbulb, label: '도움', countKey: 'helpfulCount' },
];

interface ReactionBarProps {
  reaction: PostReaction | null;
  onToggle: (type: ReactionType) => void;
  disabled?: boolean;
}

export default function ReactionBar({
  reaction,
  onToggle,
  disabled,
}: ReactionBarProps) {
  return (
    <div className="flex items-center gap-4">
      {REACTIONS.map(({ type, icon: Icon, label, countKey }) => {
        const isActive = reaction?.myReactionType === type;
        const count = reaction?.[countKey] ?? 0;

        return (
          <button
            key={type}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // 리액션을 눌렀는데 상세 페이지로 이동하는 현상을 막음
              onToggle(type);
            }}
            disabled={disabled}
            className={`flex items-center gap-1 text-sm transition-colors ${
              isActive ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={16} fill={isActive ? 'currentColor' : 'none'} />
            {/* 리액션이 0보다 크지 않다면 리액션 종류를 표시 */}
            <span className="text-xs">{count > 0 ? count : label}</span>
          </button>
        );
      })}
    </div>
  );
}
