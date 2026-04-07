import { Heart, MessageSquare, Bookmark, Share2 } from 'lucide-react';
import type { CommentResponse } from '../../types/post';
import { formatRelativeTime } from '../../utils/formatDate';

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
        <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {comment.authorNickname[0] ?? '?'}
        </div>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900">
            {comment.authorNickname}
          </span>
          {replyToNickname && (
            <span className="text-xs text-gray-400">@{replyToNickname}</span>
          )}
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
        <div className="flex items-center gap-4 text-gray-400">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs hover:text-red-400 transition-colors"
          >
            <Heart size={14} />
            <span>7</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMessageClick?.();
            }}
            className="flex items-center gap-1 text-xs hover:text-gray-600 transition-colors"
          >
            <MessageSquare size={14} />
            <span>{replyCount ?? 0}</span>
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs hover:text-yellow-500 transition-colors"
          >
            <Bookmark size={14} />
            <span>15</span>
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs hover:text-blue-400 transition-colors"
          >
            <Share2 size={14} />
            <span>75</span>
          </button>
        </div>
      )}
    </div>
  );
}
