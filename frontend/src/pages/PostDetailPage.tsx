import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, ThumbsUp, ArrowLeft, Trash2, Pencil, Bookmark } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchPost,
  deletePost,
  fetchComments,
  createComment,
  deleteComment,
  likePost,
  unlikePost,
  scrapPost,
  unscrapPost,
} from '../api/posts';
import { useAuthStore } from '../stores/useAuthStore';
import type { PostDetail, CommentResponse } from '../types/post';

const THERAPY_AREA_LABELS: Record<string, string> = {
  OCCUPATIONAL_THERAPY: '작업치료',
  SPEECH_THERAPY: '언어치료',
  COGNITIVE_THERAPY: '인지치료',
  PLAY_THERAPY: '놀이치료',
};

const AGE_GROUP_LABELS: Record<string, string> = {
  AGE_0_2: '만 0~2세',
  AGE_3_5: '만 3~5세',
  AGE_6_12: '만 6~12세',
  AGE_13_18: '만 13~18세',
  AGE_19_64: '만 19~64세',
  AGE_65_PLUS: '만 65세 이상',
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

function PostDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <Skeleton className="h-5 w-20 mb-6" />
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4 mb-4" />
          <Skeleton className="h-4 w-40 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
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

  const [scrapped, setScrapped] = useState(false);
  const [scrapping, setScrapping] = useState(false);

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
        setScrapped(postData.scrapped);
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

  async function handleToggleScrap() {
    if (!post || scrapping) return;
    setScrapping(true);
    const nextScrapped = !scrapped;
    setScrapped(nextScrapped);
    try {
      if (nextScrapped) {
        await scrapPost(post.id);
      } else {
        await unscrapPost(post.id);
      }
    } catch {
      setScrapped(!nextScrapped);
    } finally {
      setScrapping(false);
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
    return (
      <p className="text-center text-destructive py-20">
        {error ?? '게시글을 찾을 수 없어요.'}
      </p>
    );

  const isAuthor = user?.id === post.author.id;
  const therapyLabel = post.therapyArea ? THERAPY_AREA_LABELS[post.therapyArea] : null;
  const ageLabel = post.ageGroup ? AGE_GROUP_LABELS[post.ageGroup] : null;
  const topComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId: number) =>
    comments.filter((c) => c.parentCommentId === parentId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* 뒤로가기 */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        목록으로
      </Button>

      {/* 게시글 */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          {/* 뱃지 */}
          {(therapyLabel || ageLabel) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {therapyLabel && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {therapyLabel}
                </Badge>
              )}
              {ageLabel && (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                  {ageLabel}
                </Badge>
              )}
            </div>
          )}

          {/* 제목 + 수정/삭제 */}
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-xl font-bold flex-1 leading-snug">{post.title}</h1>
            {isAuthor && (
              <div className="flex gap-1.5 ml-4 shrink-0">
                <Link
                  to={`/posts/${post.id}/edit`}
                  className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                >
                  <Pencil size={15} />
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDeletePost}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            )}
          </div>

          {/* 작성자 + 시간 + 조회수 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <span>{post.author.nickname}</span>
            <span>·</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
            <span className="flex items-center gap-1 ml-auto">
              <Eye size={14} />
              {post.viewCount}
            </span>
          </div>

          {/* 본문 */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>

          {/* 좋아요 / 스크랩 버튼 */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <Button
              variant={liked ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleLike}
              disabled={liking}
              className="gap-1.5"
            >
              <ThumbsUp size={15} />
              좋아요 {likeCount > 0 && likeCount}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleToggleScrap}
              disabled={scrapping}
              className={scrapped ? 'text-primary' : 'text-muted-foreground'}
            >
              <Bookmark size={16} fill={scrapped ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 입력 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3">댓글 {comments.length}개</h2>
        <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
          {replyTo !== null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                <span className="font-medium">{replyTo.nickname}</span>에게 답글 작성 중
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="underline hover:text-foreground"
              >
                취소
              </button>
            </div>
          )}
          <Textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="가볍게 한 마디 남겨보세요"
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={submitting || !commentInput.trim()}>
              댓글 작성
            </Button>
          </div>
        </form>
      </div>

      {/* 댓글 목록 */}
      <div className="flex flex-col gap-2">
        {topComments.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              isAuthor={user?.id === comment.author.id}
              onReply={() =>
                setReplyTo({ id: comment.id, nickname: comment.author.nickname })
              }
              onDelete={() => handleDeleteComment(comment.id)}
            />
            {getReplies(comment.id).length > 0 && (
              <div className="ml-4 mt-1 flex gap-2">
                <div className="w-px bg-border shrink-0 ml-3" />
                <div className="flex flex-col gap-1.5 flex-1 pt-1">
                  {getReplies(comment.id).map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isAuthor={user?.id === reply.author.id}
                      replyToNickname={comment.author.nickname}
                      onDelete={() => handleDeleteComment(reply.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
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
    <Card>
      <CardContent className="pt-3 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{comment.author.nickname}</span>
            {replyToNickname && (
              <span className="text-xs text-muted-foreground">↳ @{replyToNickname}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
        </p>
        {!comment.deleted && (
          <div className="flex gap-2 mt-2">
            {onReply && (
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground h-auto px-1 py-0.5"
                onClick={onReply}
              >
                답글
              </Button>
            )}
            {isAuthor && (
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:text-destructive h-auto px-1 py-0.5"
                onClick={onDelete}
              >
                삭제
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
