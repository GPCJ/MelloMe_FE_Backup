import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Eye, Heart, MessageSquare, ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
  likePost,
  unlikePost,
} from '../api/posts';
import { useAuthStore } from '../stores/useAuthStore';
import type { PostDetail, CommentResponse } from '../types/post';

const THERAPY_AREA_LABELS: Record<string, string> = {
  OCCUPATIONAL_THERAPY: '작업치료',
  SPEECH_THERAPY: '언어치료',
  COGNITIVE_THERAPY: '인지치료',
  PLAY_THERAPY: '놀이치료',
};

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(isoString).toLocaleDateString('ko-KR');
}

function AuthorAvatar({ nickname }: { nickname: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-purple-300 flex items-center justify-center text-white text-sm font-bold shrink-0">
      {nickname[0]}
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
  const user = useAuthStore((s) => s.user);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const [commentInput, setCommentInput] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; nickname: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    const id = Number(postId);
    Promise.all([fetchPost(id), fetchComments(id)])
      .then(([postData, commentsData]) => {
        setPost(postData);
        setLiked(postData.myReactionType === 'LIKE');
        setLikeCount(postData.likeCount);
        setComments(commentsData);
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleToggleLike() {
    if (!post || liking) return;
    setLiking(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));
    try {
      if (nextLiked) {
        await likePost(post.id);
      } else {
        await unlikePost(post.id);
      }
    } catch {
      setLiked(!nextLiked);
      setLikeCount((prev) => prev + (nextLiked ? -1 : 1));
    } finally {
      setLiking(false);
    }
  }

  async function handleDeletePost() {
    if (!post || !confirm('게시글을 삭제할까요?')) return;
    await deletePost(post.id);
    navigate('/posts');
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
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!postId || !confirm('댓글을 삭제할까요?')) return;
    await deleteComment(Number(postId), commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) return <PostDetailSkeleton />;
  if (error || !post)
    return <p className="text-center text-destructive py-20">{error ?? '게시글을 찾을 수 없어요.'}</p>;

  const isAuthor = user?.id === post.author.id;
  const therapyLabel =
    post.therapyArea && post.therapyArea !== 'UNSPECIFIED'
      ? THERAPY_AREA_LABELS[post.therapyArea]
      : null;
  const topComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId: number) => comments.filter((c) => c.parentCommentId === parentId);

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
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/posts/${post.id}/edit`)}>
                <Pencil size={14} className="mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeletePost}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 size={14} className="mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 게시글 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <AuthorAvatar nickname={post.author.nickname} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{post.author.nickname}</span>
              {therapyLabel && (
                <Badge variant="secondary" className="text-xs">{therapyLabel}</Badge>
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
        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">{post.title}</h1>

        {/* 본문 */}
        <div
          className="post-content mb-6"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* 좋아요 / 댓글 수 */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleToggleLike}
            disabled={liking}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            공감 {likeCount}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <MessageSquare size={16} />
            댓글 {comments.length}
          </span>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">댓글 {comments.length}</h2>

        {/* 댓글 입력 */}
        <form onSubmit={handleSubmitComment} className="mb-6">
          {replyTo !== null && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <span>
                <span className="font-medium text-gray-600">{replyTo.nickname}</span>에게 답글 작성 중
              </span>
              <button type="button" onClick={() => setReplyTo(null)} className="underline hover:text-gray-700">
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
            <Button type="submit" size="sm" disabled={submitting || !commentInput.trim()}>
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
                isAuthor={user?.id === comment.author.id}
                onReply={() => setReplyTo({ id: comment.id, nickname: comment.author.nickname })}
                onDelete={() => handleDeleteComment(comment.id)}
              />
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="pl-6 border-l-2 border-gray-100 ml-4">
                  <CommentItem
                    comment={reply}
                    isAuthor={user?.id === reply.author.id}
                    replyToNickname={comment.author.nickname}
                    onDelete={() => handleDeleteComment(reply.id)}
                  />
                </div>
              ))}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">첫 댓글을 남겨보세요!</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: CommentResponse;
  isAuthor: boolean;
  onReply?: () => void;
  onDelete: () => void;
  replyToNickname?: string;
}

function CommentItem({ comment, isAuthor, onReply, onDelete, replyToNickname }: CommentItemProps) {
  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
          {comment.author.nickname[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">{comment.author.nickname}</span>
              {replyToNickname && (
                <span className="text-xs text-gray-400">↳ @{replyToNickname}</span>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
          </p>
          {!comment.deleted && (
            <div className="flex gap-3 mt-2">
              {onReply && (
                <button onClick={onReply} className="text-xs text-gray-400 hover:text-gray-700">
                  답글
                </button>
              )}
              {isAuthor && (
                <button onClick={onDelete} className="text-xs text-gray-400 hover:text-red-500">
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
