import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import CommentCard from '../../components/post/CommentCard';
import CommentInput from '../../components/post/CommentInput';
import MobilePageHeader from '@/components/common/MobilePageHeader';
import MobileFixedBottom from '@/components/common/MobileFixedBottom';
import { useReplyInput } from '../../hooks/useReplyInput';
import { useCommentSubmit } from '../../hooks/useCommentSubmit';
import { fetchComments } from '../../api/posts';
import type { CommentResponse } from '../../types/post';

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

  if (loading) return null;
  if (error || !parentComment)
    return (
      <p className="text-center text-destructive py-20">{error ?? '댓글을 찾을 수 없어요.'}</p>
    );

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

      {/* 부모 댓글 */}
      <div className="mb-2">
        <CommentCard
          comment={parentComment}
          replyCount={replies.length}
          onMessageClick={() => handleReplyClick(parentComment.authorNickname)}
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
      {replies.length > 0 && (
        <div className="flex flex-col gap-3">
          {replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              replyToNickname={parentComment.authorNickname}
              onMessageClick={() => handleReplyClick(reply.authorNickname)}
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
