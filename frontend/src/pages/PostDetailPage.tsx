import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  Eye,
  MessageSquare,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  FileText,
} from 'lucide-react';
import ReactionBar from '../components/ReactionBar';
import VerifiedBadge from '../components/VerifiedBadge';
import { getReaction } from '../api/posts';
import { useReactionToggle } from '../hooks/useReactionToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  fetchPost,
  deletePost,
  fetchComments,
  createComment,
  deleteComment,
} from '../api/posts';
import type { PostDetail, CommentResponse } from '../types/post';
import { THERAPY_AREA_LABELS } from '../constants/post';
import { formatRelativeTime } from '../utils/formatDate';

function AuthorAvatar({ nickname }: { nickname: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-purple-300 flex items-center justify-center text-white text-sm font-bold shrink-0">
      {nickname[0] ?? '?'}
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { reaction, setReaction, toggling, handleToggle } = useReactionToggle({
    postId: Number(postId) || 0,
    empathyCount: 0,
    appreciateCount: 0,
    helpfulCount: 0,
    myReactionType: null,
  });

  const [commentInput, setCommentInput] = useState('');
  const [replyTo, setReplyTo] = useState<{
    id: number;
    nickname: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId || isNaN(Number(postId))) {
      setError('게시글을 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    const id = Number(postId);
    Promise.all([fetchPost(id), fetchComments(id), getReaction(id)])
      .then(([postData, commentsData, reactionData]) => {
        setPost(postData);
        setComments(commentsData);
        setReaction(reactionData);
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleDeletePost() {
    if (!post || !confirm('게시글을 삭제할까요?')) return;
    try {
      await deletePost(post.id);
      navigate('/posts');
    } catch {
      alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!postId || !commentInput.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await createComment(Number(postId), {
        content: commentInput,
        ...(replyTo !== null && { parentCommentId: replyTo.id }),
      });
      setComments((prev) => [...prev, newComment]);
      setCommentInput('');
      setReplyTo(null);
    } catch {
      alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!postId || !confirm('댓글을 삭제할까요?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }

  if (loading) return <PostDetailSkeleton />;
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
  const topComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId: number) =>
    comments.filter((c) => c.parentCommentId === parentId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8">
      {/* 상단 내비 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        {(post.canEdit || post.canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.canEdit && (
                <DropdownMenuItem
                  onClick={() => navigate(`/posts/${post.id}/edit`)}
                >
                  <Pencil size={14} className="mr-2" />
                  수정
                </DropdownMenuItem>
              )}
              {post.canDelete && (
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 size={14} className="mr-2" />
                  삭제
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 게시글 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <AuthorAvatar nickname={post.authorNickname} />
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

        {/* 제목 */}
        {post.title && (
          <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
            {post.title}
          </h1>
        )}

        {/* 본문 */}
        <div
          className="post-content mb-6"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* 첨부파일 */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              첨부파일 ({post.attachments.length})
            </h3>
            <div className="flex flex-col gap-2">
              {post.attachments.map((att) => {
                const isImage = att.contentType.startsWith('image/');
                return (
                  <div key={att.id}>
                    {isImage && (
                      <img
                        src={att.downloadUrl}
                        alt={att.originalFilename}
                        className="rounded-lg max-h-80 object-contain mb-2"
                      />
                    )}
                    <a
                      href={att.downloadUrl}
                      download={att.originalFilename}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                    >
                      {isImage ? <Download size={16} /> : <FileText size={16} />}
                      <span className="truncate flex-1">{att.originalFilename}</span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {(att.sizeBytes / 1024).toFixed(0)}KB
                      </span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 리액션 + 댓글 수 */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <ReactionBar
            reaction={reaction}
            onToggle={handleToggle}
            disabled={toggling}
          />
          <span className="flex items-center gap-1.5 text-sm text-gray-400 ml-auto">
            <MessageSquare size={16} />
            댓글 {comments.length}
          </span>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          댓글 {comments.length}
        </h2>

        {/* 댓글 입력 */}
        <form onSubmit={handleSubmitComment} className="mb-6">
          {replyTo !== null && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <span>
                <span className="font-medium text-gray-600">
                  {replyTo.nickname}
                </span>
                에게 답글 작성 중
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="underline hover:text-gray-700"
              >
                취소
              </button>
            </div>
          )}
          <Textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글을 입력해주세요"
            rows={3}
            className="mb-2 resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !commentInput.trim()}
            >
              댓글 작성
            </Button>
          </div>
        </form>

        {/* 댓글 목록 */}
        <div className="flex flex-col divide-y divide-gray-100">
          {topComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                isAuthor={comment.canDelete}
                onReply={() =>
                  setReplyTo({
                    id: comment.id,
                    nickname: comment.authorNickname,
                  })
                }
                onDelete={() => handleDeleteComment(comment.id)}
              />
              {getReplies(comment.id).map((reply) => (
                <div
                  key={reply.id}
                  className="pl-6 border-l-2 border-gray-100 ml-4"
                >
                  <CommentItem
                    comment={reply}
                    isAuthor={reply.canDelete}
                    replyToNickname={comment.authorNickname}
                    onReply={() =>
                      setReplyTo({
                        id: comment.id,
                        nickname: reply.authorNickname,
                      })
                    }
                    onDelete={() => handleDeleteComment(reply.id)}
                  />
                </div>
              ))}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              첫 댓글을 남겨보세요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: CommentResponse;
  isAuthor: boolean;
  onReply: () => void;
  onDelete: () => void;
  replyToNickname?: string;
}

function CommentItem({
  comment,
  isAuthor,
  onReply,
  onDelete,
  replyToNickname,
}: CommentItemProps) {
  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
          {comment.authorNickname[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">
                {comment.authorNickname}
              </span>
              {replyToNickname && (
                <span className="text-xs text-gray-400">
                  ↳ @{replyToNickname}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
          </p>
          {!comment.deleted && (
            <div className="flex gap-3 mt-2">
              {onReply && (
                <button
                  onClick={onReply}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  답글
                </button>
              )}
              {isAuthor && (
                <button
                  onClick={onDelete}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  삭제
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
