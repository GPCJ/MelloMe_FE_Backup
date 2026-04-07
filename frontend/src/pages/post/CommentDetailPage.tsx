import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import CommentCard from '../../components/post/CommentCard';
import { fetchComments, createComment } from '../../api/posts';
import type { CommentResponse } from '../../types/post';

export default function CommentDetailPage() {
  const { postId, commentId } = useParams<{
    postId: string;
    commentId: string;
  }>();
  const navigate = useNavigate();

  const [parentComment, setParentComment] = useState<CommentResponse | null>(
    null,
  );
  const [replies, setReplies] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [replyToNickname, setReplyToNickname] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  function handleReplyClick(nickname: string) {
    setReplyToNickname(nickname);
    setReplyInput(`@${nickname} `);
    setShowReplyInput(true);
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!postId || !commentId || !replyInput.trim()) return;
    setSubmitting(true);
    try {
      const newReply = await createComment(Number(postId), {
        content: replyInput,
        parentCommentId: Number(commentId),
      });
      setReplies((prev) => [...prev, newReply]);
      setReplyInput('');
      setReplyToNickname(null);
      setShowReplyInput(false);
    } catch {
      alert('답글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;
  if (error || !parentComment)
    return (
      <p className="text-center text-destructive py-20">
        {error ?? '댓글을 찾을 수 없어요.'}
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/posts/${postId}`)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-bold text-gray-900">댓글 달기</h1>
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* 부모 댓글 */}
      <div className="mb-2">
        <CommentCard
          comment={parentComment}
          replyCount={replies.length}
          onMessageClick={() => handleReplyClick(parentComment.authorNickname)}
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

      {/* 하단 고정 답글 입력 */}
      {showReplyInput && (
        <form
          onSubmit={handleSubmitReply}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3"
        >
          <div className="max-w-3xl mx-auto">
            {replyToNickname && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span>
                  <span className="font-medium text-gray-600">
                    {replyToNickname}
                  </span>
                  에게 답글 작성 중
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyInput('');
                    setReplyToNickname(null);
                  }}
                  className="underline hover:text-gray-700"
                >
                  취소
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="댓글을 입력하세요..."
                autoFocus
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="submit"
                disabled={submitting || !replyInput.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                답글 달기
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
