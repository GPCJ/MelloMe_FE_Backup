import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import CommentCard from '../../components/post/CommentCard';
import CommentInput from '../../components/post/CommentInput';
import MobilePageHeader from '@/components/common/MobilePageHeader';
import MobileFixedBottom from '@/components/common/MobileFixedBottom';
import { useReplyInput } from '../../hooks/useReplyInput';
import { useCommentSubmit } from '../../hooks/useCommentSubmit';
import { fetchComments, deleteComment, updateComment } from '../../api/posts';
import type { CommentResponse } from '../../types/post';
import { useCommentReactionToggle } from '../../hooks/useCommentReactionToggle';

export default function CommentDetailPage() {
  const { postId, commentId } = useParams<{
    postId: string;
    commentId: string;
  }>();
  const location = useLocation();
  const autoReply = (location.state as { autoReply?: boolean })?.autoReply;

  const [parentComment, setParentComment] = useState<CommentResponse | null>(null);
  const [replies, setReplies] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 편집 모드 — 부모/대댓글 ID는 전역적으로 유니크하므로 같은 state로 추적 가능.
  // 한 번에 한 카드만 편집 모드(B 옵션) — 여러 textarea 동시 노출로 인한 모바일 키보드 충돌 방지.
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const {
    showReplyInput,
    replyInput,
    setReplyInput,
    replyToNickname,
    handleReplyClick,
    resetReply,
  } = useReplyInput();

  const { submitting, handleSubmit: handleSubmitReply } = useCommentSubmit({
    postId: Number(postId) || 0,
    parentCommentId: Number(commentId) || undefined,
    onSuccess: (newReply) => setReplies((prev) => [...prev, newReply]),
    onReset: resetReply,
  });

  useEffect(() => {
    if (!postId || !commentId) return;
    const pid = Number(postId);
    const cid = Number(commentId);
    if (isNaN(pid) || isNaN(cid)) {
      setError('댓글을 찾을 수 없어요.');
      setLoading(false);
      return;
    }

    fetchComments(pid)
      .then((comments) => {
        const parent = comments.find((c) => c.id === cid);
        if (!parent) {
          setError('댓글을 찾을 수 없어요.');
          return;
        }
        setParentComment(parent);
        setReplies(comments.filter((c) => c.parentCommentId === cid));
      })
      .catch(() => setError('댓글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId, commentId]);

  // autoReply state로 진입 시 자동으로 답글 입력 활성화
  useEffect(() => {
    if (autoReply && parentComment) {
      handleReplyClick(parentComment.authorNickname);
    }
  }, [autoReply, parentComment]);

  // 댓글 soft delete — 부모/대댓글 모두 동일 처리.
  // 부모 삭제 후에도 페이지 머물러서 "삭제된 댓글입니다." 표시 + 대댓글 유지.
  async function handleDelete(commentId: number, isParent: boolean) {
    if (!confirm('댓글을 삭제할까요?')) return;
    try {
      await deleteComment(commentId);
      if (isParent) {
        setParentComment((prev) =>
          prev ? { ...prev, deleted: true, content: '', canEdit: false, canDelete: false } : prev,
        );
      } else {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === commentId
              ? { ...r, deleted: true, content: '', canEdit: false, canDelete: false }
              : r,
          ),
        );
      }
    } catch {
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }

  // 편집 흐름 — PostDetailPage와 동일 시그니처.
  // 차이는 parentComment(단일)와 replies(배열)가 분리 state라 isParent로 분기하는 것뿐.
  function handleEditStart(commentId: number) {
    setEditingCommentId(commentId);
  }
  function handleEditCancel() {
    setEditingCommentId(null);
  }
  async function handleEditSubmit(commentId: number, isParent: boolean, newContent: string) {
    setEditSubmitting(true);
    try {
      const updated = await updateComment(commentId, { content: newContent });
      if (isParent) {
        setParentComment((prev) =>
          prev ? { ...prev, ...(updated ?? {}), content: updated?.content ?? newContent } : prev,
        );
      } else {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === commentId
              ? { ...r, ...(updated ?? {}), content: updated?.content ?? newContent }
              : r,
          ),
        );
      }
      setEditingCommentId(null);
    } catch {
      alert('댓글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setEditSubmitting(false);
    }
  }

  // useCommentReactionToggle 훅과 어뎁터 코드
  const allComments = parentComment ? [parentComment, ...replies] : replies;
  const { togglingId, handleToggle: handleCommentToggle } = useCommentReactionToggle(
    allComments,
    (next) => {
      const parentId = parentComment?.id;
      setParentComment(parentId != null ? (next.find((c) => c.id === parentId) ?? null) : null);
      setReplies(next.filter((c) => c.id !== parentId));
    },
  );

  if (loading) return null;
  if (error || !parentComment)
    return (
      <p className="text-center text-destructive py-20">{error ?? '댓글을 찾을 수 없어요.'}</p>
    );

  // 옵션 C: 삭제된 대댓글은 숨김(leaf라 컨텍스트 보존 불필요).
  const visibleReplies = replies.filter((r) => !r.deleted);

  return (
    <div className={`max-w-3xl mx-auto px-4 py-6 ${showReplyInput ? 'pb-24' : 'pb-6'}`}>
      {/* 헤더 */}
      <MobilePageHeader
        title="댓글 달기"
        backTo={`/posts/${postId}`}
        rightAction={
          <button className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical size={20} />
          </button>
        }
      />

      {/* 부모 댓글 — 직링크 컨텍스트 보존 위해 deleted여도 표시 유지 */}
      <div className="mb-2">
        <CommentCard
          comment={parentComment}
          replyCount={visibleReplies.length}
          onMessageClick={() => handleReplyClick(parentComment.authorNickname)}
          onDelete={() => handleDelete(parentComment.id, true)}
          isEditing={editingCommentId === parentComment.id}
          editSubmitting={editSubmitting}
          onEditStart={() => handleEditStart(parentComment.id)}
          onEditSubmit={(newContent) => handleEditSubmit(parentComment.id, true, newContent)}
          onEditCancel={handleEditCancel}
          onToggleReaction={(type) => handleCommentToggle(parentComment.id, type)}
          toggling={togglingId === parentComment.id}
        />
      </div>

      {/* 데스크탑 인라인 답글 입력 */}
      <div className="hidden md:block mb-4">
        <CommentInput
          value={replyInput}
          onChange={setReplyInput}
          onSubmit={(e) => handleSubmitReply(e, replyInput)}
          submitting={submitting}
          placeholder="답글을 입력하세요..."
          buttonText="답글 작성"
        />
      </div>

      {/* 대댓글 목록 */}
      {visibleReplies.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleReplies.map((reply) => (
            // 대댓글에는 리액션이 필요 없다고 판단되서 포함 안하려고 했는데 관성적으로 일단 대댓글도 CommentCard로 통일해서 사용하는게 일단은 코드 수정이 적어보여서 이렇게함
            <CommentCard
              key={reply.id}
              comment={reply}
              replyToNickname={parentComment.authorNickname}
              onMessageClick={() => handleReplyClick(reply.authorNickname)}
              onDelete={() => handleDelete(reply.id, false)}
              isEditing={editingCommentId === reply.id}
              editSubmitting={editSubmitting}
              onEditStart={() => handleEditStart(reply.id)}
              onEditSubmit={(newContent) => handleEditSubmit(reply.id, false, newContent)}
              onEditCancel={handleEditCancel}
              onToggleReaction={(type) => handleCommentToggle(reply.id, type)}
              toggling={togglingId === reply.id}
            />
          ))}
        </div>
      )}

      {/* 모바일 하단 고정 답글 입력 */}
      {showReplyInput && (
        <MobileFixedBottom className="md:hidden">
          {replyToNickname && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <span>
                <span className="font-medium text-gray-600">{replyToNickname}</span>
                에게 답글 작성 중
              </span>
              <button type="button" onClick={resetReply} className="underline hover:text-gray-700">
                취소
              </button>
            </div>
          )}
          <CommentInput
            value={replyInput}
            onChange={setReplyInput}
            onSubmit={(e) => handleSubmitReply(e, replyInput)}
            submitting={submitting}
            placeholder="답글을 입력하세요..."
            buttonText="답글 작성"
            autoFocus
          />
        </MobileFixedBottom>
      )}
    </div>
  );
}
