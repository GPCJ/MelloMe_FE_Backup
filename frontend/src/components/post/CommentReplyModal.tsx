import { useEffect, useState } from 'react';
import { ArrowLeft, PencilLine } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import VerifiedBadge from './VerifiedBadge';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCommentSubmit } from '../../hooks/useCommentSubmit';
import { formatRelativeTime } from '../../utils/formatDate';
import type { CommentResponse } from '../../types/post';

const MAX_LENGTH = 2000;

interface CommentReplyModalProps {
  // 답글이 달릴 top-level 부모 댓글. 모달 상단에 read-only 컨텍스트로 표시.
  parentComment: CommentResponse;
  postId: number;
  onClose: () => void;
  // 성공 시 PostDetailPage의 comments state에 push하기 위해 부모로 전달.
  // 모달은 close까지 책임지고, 호출처는 setComments만 처리.
  onSuccess: (newReply: CommentResponse) => void;
}

// PC 전용 답글 작성 모달.
// 모바일은 기존 라우트(/posts/:id/comments/:cid)를 유지하고, PC에서만 PostDetailPage 위에 떠서
// 부모 댓글 컨텍스트 + 본인 입력 영역만 노출하는 단순 폼이다.
// 첨부/공개범위 옵션은 시안 결정에 따라 의도적으로 제거(텍스트 content only).
export default function CommentReplyModal({
  parentComment,
  postId,
  onClose,
  onSuccess,
}: CommentReplyModalProps) {
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState('');

  // PostWriteModal과 동일 패턴: ESC로 닫기 + body 스크롤 잠금.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const { submitting, handleSubmit } = useCommentSubmit({
    postId,
    parentCommentId: parentComment.id,
    onSuccess: (newReply) => {
      onSuccess(newReply);
      onClose();
    },
  });

  const canSubmit = content.trim().length > 0 && !submitting;

  // CommentInput과 동일한 IME 중복 발화 방어 + Enter=제출, Shift+Enter=줄바꿈.
  // PC 모달 전용이라 모바일 isMobile 분기는 불필요.
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) handleSubmit(content);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      // mousedown 기준 닫기 — 모달 내부에서 시작한 드래그가 배경에서 끝나도 click이 닫힘으로 인식되는 사고 방지.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comment-reply-modal-title"
        className="w-full max-w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
      >
        {/* 헤더 — PostWriteModal과 동일 패턴: ← (close) / 가운데 타이틀 / ✏️ PencilLine (submit) */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1 -ml-1 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 id="comment-reply-modal-title" className="text-base font-semibold text-gray-900">
            댓글
          </h1>
          <button
            type="button"
            onClick={() => handleSubmit(content)}
            disabled={!canSubmit}
            aria-label="답글 게시"
            className="p-1 -mr-1 text-gray-900 hover:text-black transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <PencilLine size={20} />
          </button>
        </header>

        {/* 본문 — (1) 부모 댓글 read-only + (2) 본인 입력 영역.
            두 블록 모두 좌측 48px 프로필 컬럼 + 우측 컨텐츠 영역으로 같은 구조라
            부모 아바타 아래 세로선이 자식 입력 영역의 아바타와 자연스럽게 시각 연결된다. */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
          {/* (1) 부모 댓글 — post_feed read-only */}
          <div className="flex">
            <div className="shrink-0 w-12 flex flex-col items-center">
              <UserAvatar
                nickname={parentComment.authorNickname}
                imageUrl={parentComment.authorProfileImageUrl}
                size="md"
              />
              {/* 부모↓자식 시각 연결선 — aspect items-center 기준으로 아바타 중앙에 정렬됨 */}
              <div className="w-px flex-1 bg-gray-300 mt-2" />
            </div>
            <div className="flex-1 min-w-0 pl-2 pb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900 truncate">
                  {parentComment.authorNickname}
                </span>
                {parentComment.authorRole === 'THERAPIST' && <VerifiedBadge status="APPROVED" />}
                <span className="text-[11px] text-gray-500 shrink-0 ml-1">
                  {formatRelativeTime(parentComment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-5 mt-1 whitespace-pre-wrap">
                {parentComment.deleted ? '삭제된 댓글입니다.' : parentComment.content}
              </p>
            </div>
          </div>

          {/* (2) 본인 입력 영역 — 부모와 동일 좌측 컬럼 구조라 세로선이 그대로 이어짐 */}
          {user && (
            <div className="flex">
              <div className="shrink-0 w-12 flex flex-col items-center">
                <UserAvatar nickname={user.nickname} imageUrl={user.profileImageUrl} size="md" />
              </div>
              <div className="flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm font-bold text-gray-900 truncate">{user.nickname}</span>
                  <VerifiedBadge status={user.therapistVerification?.status} />
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="답글을 입력하세요..."
                  maxLength={MAX_LENGTH}
                  rows={3}
                  autoFocus
                  disabled={submitting}
                  className="w-full resize-none rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {content.length} / {MAX_LENGTH}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
