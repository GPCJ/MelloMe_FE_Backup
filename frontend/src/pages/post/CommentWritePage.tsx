import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ArrowLeft, Eye } from 'lucide-react';
import VerifiedBadge from '../../components/post/VerifiedBadge';
import ReactionBar from '../../components/post/ReactionBar';
import { getReaction } from '../../api/posts';
import { useReactionToggle } from '../../hooks/useReactionToggle';
import { Badge } from '@/components/ui/badge';
import { fetchPost, createComment } from '../../api/posts';
import type { PostDetail } from '../../types/post';
import { THERAPY_AREA_LABELS } from '../../constants/post';
import { formatRelativeTime } from '../../utils/formatDate';

export default function CommentWritePage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { reaction, setReaction, toggling, handleToggle } = useReactionToggle({
    postId: Number(postId) || 0,
    empathyCount: 0,
    appreciateCount: 0,
    helpfulCount: 0,
    myReactionType: null,
  });

  useEffect(() => {
    if (!postId || isNaN(Number(postId))) {
      setError('게시글을 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    const id = Number(postId);
    Promise.all([fetchPost(id), getReaction(id)])
      .then(([postData, reactionData]) => {
        setPost(postData);
        setReaction(reactionData);
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!postId || !commentInput.trim()) return;
    setSubmitting(true);
    try {
      await createComment(Number(postId), { content: commentInput });
      navigate(`/posts/${postId}`);
    } catch {
      alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;
  if (error || !post)
    return (
      <p className="text-center text-destructive py-20">
        {error ?? '게시글을 찾을 수 없어요.'}
      </p>
    );

  const therapyLabel =
    post.therapyArea && post.therapyArea !== 'UNSPECIFIED'
      ? THERAPY_AREA_LABELS[post.therapyArea]
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(`/posts/${postId}`)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-gray-900">댓글 달기</h1>
      </div>

      {/* 게시글 본문 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-purple-300 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {post.authorNickname[0] ?? '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {post.authorNickname}
              </span>
              <VerifiedBadge status={post.authorVerificationStatus} />
              {therapyLabel && (
                <Badge variant="secondary" className="text-xs">
                  {therapyLabel}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Eye size={11} />
                조회 {post.viewCount}
              </span>
            </div>
          </div>
        </div>

        <div
          className="post-content mb-6"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <ReactionBar
            reaction={reaction}
            onToggle={handleToggle}
            disabled={toggling}
          />
        </div>
      </div>

      {/* 하단 고정 댓글 입력 */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button
            type="submit"
            disabled={submitting || !commentInput.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            댓글 달기
          </button>
        </div>
      </form>
    </div>
  );
}
