import { useState, useEffect } from 'react';
import { MessageSquare, MoreHorizontal } from 'lucide-react';
import type { CommentResponse, ReactionType } from '../../types/post';
import { formatRelativeTime } from '../../utils/formatDate';
import UserAvatar from '../common/UserAvatar';
import VerifiedBadge from './VerifiedBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import ReactionBar from './ReactionBar';

interface CommentCardProps {
  comment: CommentResponse;
  replyCount?: number;
  replyToNickname?: string;
  onMessageClick?: () => void;
  onDelete?: () => void;
  // 편집 모드 — 부모(PostDetailPage/CommentDetailPage)가 editingCommentId state를 들고
  // "한 번에 한 카드만 편집" 강제. 카드별 독립 state로 두면 여러 카드가 동시에 편집 모드가
  // 될 수 있어 UX가 산만해짐(데이터 버그는 아님 — API는 commentId로 독립).
  isEditing?: boolean;
  editSubmitting?: boolean;
  onEditStart?: () => void;
  onEditSubmit?: (newContent: string) => void;
  onEditCancel?: () => void;
  onToggleReaction: (type: ReactionType) => void;
  toggling: boolean;
}

export default function CommentCard({
  comment,
  replyCount,
  replyToNickname,
  onMessageClick,
  onDelete,
  isEditing = false,
  editSubmitting = false,
  onEditStart,
  onEditSubmit,
  onEditCancel,
  onToggleReaction,
  toggling,
}: CommentCardProps) {
  // 편집 모드 진입 시 textarea 초기값을 원본으로 채워두는 로컬 state.
  // 부모에 끌어올리지 않는 이유: 입력 중 리렌더 시 keystroke이 부모까지 올라가면 다른 카드의
  // 리액션/페이지 상태까지 흔드는 광범위한 리렌더가 발생함. content는 "편집 중에만" 의미가
  // 있고 저장 순간에만 부모로 올림(onEditSubmit) → 입력 동안엔 카드 내부에서 닫힘.
  // CommentResponse.content는 optional(deleted 상태에서 빈값으로 마스킹) — 편집 시작 시점엔
  // 활성 댓글이라 string이 보장되지만, 타입 안전을 위해 빈 문자열 fallback.
  const [draft, setDraft] = useState(comment.content ?? '');
  useEffect(() => {
    // 편집 모드로 새로 들어올 때마다 원본 content로 리셋. 이전에 다른 카드 편집 중 입력했던
    // draft가 다음에 같은 카드 편집 진입 시 살아있는 사고를 막는다.
    if (isEditing) setDraft(comment.content ?? '');
  }, [isEditing, comment.content]);

  // 백엔드 CommentResponse.canDelete/canEdit 플래그로 권한 판단(작성자 또는 관리자).
  // 게시글 권한과 무관 — 댓글마다 백엔드가 따로 계산해서 내려줌.
  // 메뉴는 두 권한 중 하나라도 있고, 부모가 해당 핸들러를 넘겨줬을 때만 표시.
  const canShowEdit = !comment.deleted && comment.canEdit && !!onEditStart;
  const canShowDelete = !comment.deleted && comment.canDelete && !!onDelete;
  const showMenu = !isEditing && (canShowEdit || canShowDelete);

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
        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="p-1 -mr-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              aria-label="댓글 메뉴"
            >
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {canShowEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStart?.();
                  }}
                >
                  수정
                </DropdownMenuItem>
              )}
              {canShowDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  삭제
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 본문 — 편집 모드일 땐 inline form으로 교체.
          form onSubmit으로 묶어 Enter=저장이 자동 동작(input은 single-line이라 줄바꿈 충돌 없음).
          취소 버튼은 type="button"으로 명시 — 없으면 form 안의 button은 기본 submit이라 취소가
          저장으로 동작하는 사고가 생길 수 있다. */}
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = draft.trim();
            if (!trimmed || trimmed === comment.content) {
              // 변경 없거나 공백만 → 저장 안 하고 그대로 닫음. 빈 PATCH로 백엔드 에러 유도하지 않기 위함.
              onEditCancel?.();
              return;
            }
            onEditSubmit?.(trimmed);
          }}
          className="mb-3"
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            disabled={editSubmitting}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          />
          <div className="flex items-center gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={onEditCancel}
              disabled={editSubmitting}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={editSubmitting || !draft.trim()}
              className="px-3 py-1 text-xs font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
          {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
        </p>
      )}

      {/* 리액션 아이콘 — 편집 중엔 숨겨서 작업 흐름 방해 방지. */}
      {!comment.deleted && !isEditing && (
        <div className="flex items-center text-gray-400">
          <ReactionBar
            counts={{
              LIKE: comment.likeCount ?? 0,
              CURIOUS: comment.curiousCount ?? 0,
              USEFUL: comment.usefulCount ?? 0,
            }}
            myReactionType={comment.myReactionType ?? null}
            onToggle={onToggleReaction}
            disabled={toggling}
            size={14}
          />
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
