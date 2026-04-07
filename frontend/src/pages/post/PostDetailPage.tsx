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
  Bookmark,
} from 'lucide-react';
import ReactionBar from '../../components/post/ReactionBar';
import VerifiedBadge from '../../components/post/VerifiedBadge';
import { getReaction } from '../../api/posts';
import { useReactionToggle } from '../../hooks/useReactionToggle';
import CommentCard from '../../components/post/CommentCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  scrapPost,
  unscrapPost,
} from '../../api/posts';
import type { PostDetail, CommentResponse } from '../../types/post';
import { THERAPY_AREA_LABELS } from '../../constants/post';
import { formatRelativeTime } from '../../utils/formatDate';

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
  const [scrapped, setScrapped] = useState(false);
  const [scrapLoading, setScrapLoading] = useState(false);

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

  async function handleScrapToggle() {
    if (!post || scrapLoading) return;
    setScrapLoading(true);
    try {
      if (scrapped) {
        await unscrapPost(post.id);
      } else {
        await scrapPost(post.id);
      }
      setScrapped(!scrapped);
    } catch {
      alert('스크랩에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setScrapLoading(false);
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
          onClick={() => navigate('/posts')}
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
          <div className="flex-1 min-w-0">
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
          <button
            onClick={handleScrapToggle}
            disabled={scrapLoading}
            className="p-1.5 shrink-0 transition-colors"
          >
            <Bookmark
              size={20}
              className={scrapped ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-500'}
            />
          </button>
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
                      {isImage ? (
                        <Download size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                      <span className="truncate flex-1">
                        {att.originalFilename}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {att.sizeBytes >= 1024 * 1024
                          ? `${(att.sizeBytes / (1024 * 1024)).toFixed(1)}MB`
                          : `${(att.sizeBytes / 1024).toFixed(0)}KB`}
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
          <button
            onClick={() => navigate(`/posts/${postId}/comments`)}
            className="flex items-center gap-1.5 text-sm text-gray-400 ml-auto hover:text-gray-600 transition-colors"
          >
            <MessageSquare size={16} />
            댓글 {comments.length}
          </button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">
          댓글 {topComments.length}
        </h2>
        <div className="flex flex-col gap-3">
          {topComments.map((comment) => (
            <div
              key={comment.id}
              onClick={() =>
                navigate(`/posts/${postId}/comments/${comment.id}`)
              }
              className="cursor-pointer"
            >
              <CommentCard
                comment={comment}
                replyCount={getReplies(comment.id).length}
              />
            </div>
          ))}
          {topComments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              첫 댓글을 남겨보세요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
