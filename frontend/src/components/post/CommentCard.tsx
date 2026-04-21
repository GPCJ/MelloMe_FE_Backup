import { Heart, Star, Lightbulb, MessageSquare } from 'lucide-react';
import type { CommentResponse } from '../../types/post';
import { formatRelativeTime } from '../../utils/formatDate';
import UserAvatar from '../common/UserAvatar';
import VerifiedBadge from './VerifiedBadge';

interface CommentCardProps {
  comment: CommentResponse;
  replyCount?: number;
  replyToNickname?: string;
  onMessageClick?: () => void;
}

export default function CommentCard({
  comment,
  replyCount,
  replyToNickname,
  onMessageClick,
}: CommentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* 작성자 정보 */}
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar
          nickname={comment.authorNickname}
          imageUrl={comment.authorProfileImageUrl}
          size="sm"
        />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900">{comment.authorNickname}</span>

          {comment.authorRole === 'THERAPIST' && <VerifiedBadge status="APPROVED" />}

          {replyToNickname && <span className="text-xs text-gray-400">@{replyToNickname}</span>}
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {formatRelativeTime(comment.createdAt)}
        </span>
      </div>

      {/* 본문 */}
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
      </p>

      {/* 리액션 아이콘 */}
      {!comment.deleted && (
        <div className="flex items-center text-gray-400">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs hover:text-red-400 transition-colors"
            >
              <Heart size={14} />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs hover:text-yellow-500 transition-colors"
            >
              <Star size={14} />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs hover:text-amber-500 transition-colors"
            >
              <Lightbulb size={14} />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMessageClick?.();
            }}
            className="flex items-center gap-1 text-xs hover:text-gray-600 transition-colors ml-auto"
          >
            <MessageSquare size={14} />
            {replyCount != null && replyCount > 0 && <span>{replyCount}</span>}
          </button>
        </div>
      )}
    </div>
  );
}
