import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Eye, MoreVertical } from 'lucide-react';
import VerifiedBadge from '../../components/post/VerifiedBadge';
import ReactionBar from '../../components/post/ReactionBar';
import {
  useReactionToggle,
  reactionFromPostDetail,
} from '../../hooks/useReactionToggle';
import { Badge } from '@/components/shadcn-ui/badge';
import CommentInput from '../../components/post/CommentInput';
import MobilePageHeader from '@/components/common/MobilePageHeader';
import MobileFixedBottom from '@/components/common/MobileFixedBottom';
import { fetchPost, createComment } from '../../api/posts';
import type { PostDetail } from '../../types/post';
import { THERAPY_AREA_LABELS } from '../../constants/post';
import { formatRelativeTime } from '../../utils/formatDate';
import UserAvatar from '../../components/common/UserAvatar';

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
    likeCount: 0,
    curiousCount: 0,
    usefulCount: 0,
    myReactionType: null,
  });

  useEffect(() => {
    if (!postId || isNaN(Number(postId))) {
      setError('게시글을 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    const id = Number(postId);
    // 백엔드 명세 변경(2026-04-21): 게시글 상세 응답에 reactionCounts/myReactionType 포함됨
    // → 별도 GET /reaction 호출 불필요. fetchPost 응답에서 직접 변환해서 초기화.
    fetchPost(id)
      .then((postData) => {
        setPost(postData);
        setReaction(reactionFromPostDetail(postData));
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
          <MobilePageHeader
            title="댓글 달기"
            backTo={`/posts/${postId}`}
            rightAction={
              <button className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical size={20} />
              </button>
            }
          />

          {/* 게시글 본문 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
              <UserAvatar
                nickname={post.authorNickname}
                imageUrl={post.authorProfileImageUrl}
                size="md"
              />
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
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <ReactionBar
                reaction={reaction}
                onToggle={handleToggle}
                disabled={toggling}
              />
            </div>
          </div>

      {/* 하단 댓글 입력 */}
      <MobileFixedBottom>
        <CommentInput
          value={commentInput}
          onChange={setCommentInput}
          onSubmit={handleSubmit}
          submitting={submitting}
          autoFocus
        />
      </MobileFixedBottom>
    </div>
  );
}
