import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, ThumbsUp, ThumbsDown, ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchPost, deletePost, fetchComments, createComment, deleteComment } from '../api/posts';
import { useAuthStore } from '../stores/useAuthStore';
import type { PostDetail, CommentResponse } from '../types/post';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentInput, setCommentInput] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    const id = Number(postId);
    Promise.all([fetchPost(id), fetchComments(id)])
      .then(([postData, commentsData]) => {
        setPost(postData);
        setComments(commentsData);
      })
      .catch(() => setError('게시글을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

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
        ...(replyTo !== null && { parentCommentId: replyTo }),
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

  if (loading) return <p className="text-center text-gray-500 py-20">불러오는 중...</p>;
  if (error || !post) return <p className="text-center text-red-500 py-20">{error ?? '게시글을 찾을 수 없어요.'}</p>;

  const isAuthor = user?.id === post.author.id;
  const topComments = comments.filter((c) => !c.parentCommentId);
  const replies = (parentId: number) => comments.filter((c) => c.parentCommentId === parentId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} /> 목록으로
      </button>

      {/* 게시글 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex-1">{post.title}</h1>
            {isAuthor && (
              <div className="flex gap-2 ml-4">
                <Link
                  to={`/posts/${post.id}/edit`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={handleDeletePost}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
            <span>{post.author.nickname}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
            <span className="flex items-center gap-1 ml-auto">
              <Eye size={14} /> {post.viewCount}
            </span>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <ThumbsUp size={15} /> {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsDown size={15} /> {post.dislikeCount}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 목록 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          댓글 {comments.length}개
        </h2>
        <div className="flex flex-col gap-3">
          {topComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                isAuthor={user?.id === comment.author.id}
                onReply={() => setReplyTo(comment.id)}
                onDelete={() => handleDeleteComment(comment.id)}
              />
              {/* 대댓글 */}
              {replies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-8 mt-2">
                  <CommentItem
                    comment={reply}
                    isAuthor={user?.id === reply.author.id}
                    onDelete={() => handleDeleteComment(reply.id)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 입력 */}
      <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
        {replyTo !== null && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>대댓글 작성 중</span>
            <button type="button" onClick={() => setReplyTo(null)} className="underline">
              취소
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={2}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <button
            type="submit"
            disabled={submitting || !commentInput.trim()}
            className={buttonVariants({ size: 'sm' })}
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}

interface CommentItemProps {
  comment: CommentResponse;
  isAuthor: boolean;
  onReply?: () => void;
  onDelete: () => void;
}

function CommentItem({ comment, isAuthor, onReply, onDelete }: CommentItemProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800">{comment.author.nickname}</span>
        <span className="text-xs text-gray-400">
          {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>
      <p className="text-sm text-gray-700">
        {comment.deleted ? '삭제된 댓글입니다.' : comment.content}
      </p>
      {!comment.deleted && (
        <div className="flex gap-3 mt-2">
          {onReply && (
            <button onClick={onReply} className="text-xs text-gray-400 hover:text-gray-600">
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
  );
}
