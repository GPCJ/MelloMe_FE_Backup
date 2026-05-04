import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  Eye,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  FileText,
  Bookmark,
  Lock,
} from 'lucide-react';
import ReactionBar from '../../components/post/ReactionBar';
import VerifiedBadge from '../../components/post/VerifiedBadge';
import { useReactionToggle, reactionFromPostDetail } from '../../hooks/useReactionToggle';
import CommentCard from '../../components/post/CommentCard';
import CommentInput from '../../components/post/CommentInput';
import { useCommentSubmit } from '../../hooks/useCommentSubmit';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import {
  fetchPost,
  deletePost,
  deleteComment,
  updateComment,
  fetchComments,
  fetchPostImages,
  scrapPost,
  unscrapPost,
} from '../../api/posts';
import type { PostDetail, CommentResponse, PostImage } from '../../types/post';
import { THERAPY_AREA_LABELS } from '../../constants/post';
import { formatRelativeTime } from '../../utils/formatDate';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import UserAvatar from '../../components/common/UserAvatar';
import MobilePageHeader from '@/components/common/MobilePageHeader';
import { trackReaction } from '../../lib/analytics';
import axios from 'axios';
import { useCommentReactionToggle } from '../../hooks/useCommentReactionToggle';

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
  const [images, setImages] = useState<PostImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrapped, setScrapped] = useState(false);
  const [scrapLoading, setScrapLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  // 한 번에 한 댓글만 편집 모드로 강제. CommentCard 내부 state로 두지 않는 이유는
  // 여러 카드가 동시에 textarea로 펼쳐져 모바일 키보드/포커스가 산만해지기 때문.
  // editSubmitting은 PATCH 진행 중 저장 버튼 disable + 카드 잠금에 사용.
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // handleCommentToggle은 별칭, handleToggle함수가 이미 이 파일 내부에 있기 때문에 별칭을 사용했음
  const { togglingId, handleToggle: handleCommentToggle } = useCommentReactionToggle(
    comments,
    setComments,
  );

  const { reaction, setReaction, toggling, handleToggle } = useReactionToggle({
    postId: Number(postId) || 0,
    likeCount: 0,
    curiousCount: 0,
    usefulCount: 0,
    myReactionType: null,
  });

  const { submitting, handleSubmit: handleSubmitComment } = useCommentSubmit({
    postId: Number(postId) || 0,
    onSuccess: (newComment) => {
      setComments((prev) => [...prev, newComment]);
      setCommentInput('');
    },
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
    Promise.all([
      fetchPost(id),
      fetchComments(id),
      fetchPostImages(id).catch(() => [] as PostImage[]),
    ])
      .then(([postData, commentsData, imagesData]) => {
        setPost(postData);
        setScrapped(postData.scrapped ?? false);
        setComments(commentsData);
        setReaction(reactionFromPostDetail(postData));
        setImages(imagesData);
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

  // 댓글 soft delete — 응답 본문이 없으므로 로컬 state에서 deleted:true로 패치.
  // refetch보다 깜빡임 없고, "삭제된 댓글입니다." 문구는 CommentCard가 deleted 플래그로 자동 표시.
  async function handleDeleteComment(commentId: number) {
    if (!confirm('댓글을 삭제할까요?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, deleted: true, content: '', canEdit: false, canDelete: false }
            : c,
        ),
      );
    } catch {
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }

  // 편집 흐름은 3단계로 분리: 시작/제출/취소.
  // 시작은 단순 setState — editingCommentId 하나로 "현재 편집 중" 카드를 추적.
  // 제출은 PATCH 응답을 그대로 state에 머지(content/updatedAt 등 백엔드 갱신값을 신뢰).
  // 응답이 비어있는 케이스를 대비해 fallback으로 content만 patch — 삭제와 다르게 PATCH는
  // 일반적으로 갱신된 리소스를 돌려주지만, 401 refresh 후 재시도 등으로 응답 형태가 달라질
  // 가능성을 가드.
  function handleEditStart(commentId: number) {
    setEditingCommentId(commentId);
  }
  function handleEditCancel() {
    setEditingCommentId(null);
  }
  async function handleEditSubmit(commentId: number, newContent: string) {
    setEditSubmitting(true);
    try {
      const updated = await updateComment(commentId, { content: newContent });
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, ...(updated ?? {}), content: updated?.content ?? newContent }
            : c,
        ),
      );
      setEditingCommentId(null);
    } catch {
      alert('댓글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setEditSubmitting(false);
    }
  }

  async function downloadAsBlob(url: string, filename: string) {
    try {
      const res = await axios.get<Blob>(url, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      console.error('이미지 다운로드 실패', err);
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
        // KPI "반응 수"는 신규 스크랩만 카운트.
        trackReaction('scrap', { postId: post.id });
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
      <p className="text-center text-destructive py-20">{error ?? '게시글을 찾을 수 없어요.'}</p>
    );

  const therapyLabel =
    post.therapyArea && post.therapyArea !== 'UNSPECIFIED'
      ? THERAPY_AREA_LABELS[post.therapyArea]
      : null;
  // 옵션 C: 삭제된 댓글은 숨기되, 대댓글이 살아있는 부모만 "삭제된 댓글입니다." 형태로 보존.
  // 대댓글 카운트도 살아있는 것만 집계해 UI 일관성 유지.
  const getReplies = (parentId: number) =>
    comments.filter((c) => c.parentCommentId === parentId && !c.deleted);
  const topComments = comments.filter(
    (c) => !c.parentCommentId && (!c.deleted || getReplies(c.id).length > 0),
  );
  // 카운트는 살아있는 댓글만 — 삭제된 부모 카드는 컨텍스트용으로만 표시되지 카운트엔 미포함.
  const visibleCommentCount = comments.filter((c) => !c.deleted).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8">
      {/* 상단 헤더 */}
      <MobilePageHeader
        title="게시글"
        backTo={`/posts`}
        // 수정, 삭제 케밥 메뉴
        rightAction={
          (post.canEdit || post.canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {post.canEdit && (
                  <DropdownMenuItem onClick={() => navigate(`/posts/${post.id}/edit`)}>
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
          )
        }
      />

      {/* 데스크탑: 카드 바깥 상단 우측 케밥 메뉴 */}
      {(post.canEdit || post.canDelete) && (
        <div className="hidden md:flex justify-end mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.canEdit && (
                <DropdownMenuItem onClick={() => navigate(`/posts/${post.id}/edit`)}>
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
        </div>
      )}

      {/* 게시글 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <UserAvatar
            nickname={post.authorNickname}
            imageUrl={post.authorProfileImageUrl}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{post.authorNickname}</span>
              <VerifiedBadge status={post.authorVerificationStatus} />
              {post.visibility === 'PRIVATE' && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-medium"
                  aria-label="치료사 전용 게시글"
                  title="치료사 전용 게시글"
                >
                  <Lock size={11} />
                  치료사 전용
                </span>
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
              className={
                scrapped ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-500'
              }
            />
          </button>
        </div>

        {/* 해시태그 */}
        {therapyLabel && (
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
              #{therapyLabel}
            </span>
          </div>
        )}

        {/* 본문 */}
        {post.isBlurred ? (
          <div className="bg-stone-50 rounded-lg py-12 px-4 mb-6">
            <p className="text-center text-gray-600 text-sm">
              인증된 회원에게만 공개된 게시물입니다.
            </p>
          </div>
        ) : (
          <div
            className="post-content mb-6"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content),
            }}
          />
        )}

        {/* 첨부파일 + 이미지 */}
        {((post.attachments && post.attachments.length > 0) || images.length > 0) && (
          <div className="mb-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              첨부파일 ({(post.attachments?.length ?? 0) + images.length})
            </h3>
            <div className="flex flex-col gap-2">
              {images.map((img) => (
                <div key={`img-${img.id}`}>
                  <img
                    src={resolveImageUrl(img.imageUrl) ?? ''}
                    alt={img.originalFilename}
                    className="rounded-lg max-h-80 object-contain mb-2"
                  />
                  <a
                    href={resolveImageUrl(img.imageUrl) ?? '#'}
                    download={img.originalFilename}
                    onClick={(e) => {
                      e.preventDefault();
                      trackReaction('download', { postId: post.id });
                      void downloadAsBlob(
                        resolveImageUrl(img.imageUrl) ?? '',
                        img.originalFilename,
                      );
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                  >
                    <Download size={16} />
                    <span className="truncate flex-1">{img.originalFilename}</span>
                  </a>
                </div>
              ))}
              {post.attachments?.map((att) => {
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
                      onClick={(e) => {
                        trackReaction('download', { postId: post.id });
                        e.preventDefault();
                        void downloadAsBlob(att.downloadUrl, att.originalFilename);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                    >
                      {isImage ? <Download size={16} /> : <FileText size={16} />}
                      <span className="truncate flex-1">{att.originalFilename}</span>
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
            // reaction이 null일 경우 문제 발생함 혹시나 리액션 관련 버그 발생 시 이 코드 참조
            counts={{
              LIKE: reaction.likeCount,
              CURIOUS: reaction.curiousCount,
              USEFUL: reaction.usefulCount,
            }}
            myReactionType={reaction.myReactionType}
            onToggle={handleToggle}
            disabled={toggling}
          />
          <button
            onClick={() => navigate(`/posts/${postId}/comments`)}
            className="flex md:hidden items-center gap-1.5 text-sm text-gray-400 ml-auto hover:text-gray-600 transition-colors"
          >
            <MessageSquare size={16} />
            댓글 {visibleCommentCount}
          </button>
          <span className="hidden md:flex items-center gap-1.5 text-sm text-gray-400 ml-auto">
            <MessageSquare size={16} />
            댓글 {visibleCommentCount}
          </span>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">댓글 {visibleCommentCount}</h2>

        {/* 데스크탑 인라인 댓글 입력 */}
        <div className="hidden md:block mb-4">
          <CommentInput
            value={commentInput}
            onChange={setCommentInput}
            onSubmit={(e) => handleSubmitComment(e, commentInput)}
            submitting={submitting}
          />
        </div>

        <div className="flex flex-col gap-3">
          {topComments.map((comment) => {
            const isEditing = editingCommentId === comment.id;
            return (
              <div
                key={comment.id}
                // 편집 중엔 카드 클릭으로 인한 댓글 상세 이동 차단.
                // form 내부 클릭은 CommentCard가 stopPropagation으로 보호하지만, 카드 여백
                // (작성자 영역 등)을 누르면 navigate가 발동해 작업 중인 입력이 사라지는 사고가 남.
                onClick={
                  isEditing ? undefined : () => navigate(`/posts/${postId}/comments/${comment.id}`)
                }
                className={isEditing ? '' : 'cursor-pointer'}
              >
                <CommentCard
                  comment={comment}
                  replyCount={getReplies(comment.id).length}
                  onMessageClick={() =>
                    navigate(`/posts/${postId}/comments/${comment.id}`, {
                      state: { autoReply: true },
                    })
                  }
                  onDelete={() => handleDeleteComment(comment.id)}
                  isEditing={isEditing}
                  editSubmitting={editSubmitting}
                  onEditStart={() => handleEditStart(comment.id)}
                  onEditSubmit={(newContent) => handleEditSubmit(comment.id, newContent)}
                  onEditCancel={handleEditCancel}
                  onToggleReaction={(type) => handleCommentToggle(comment.id, type)}
                  toggling={togglingId === comment.id}
                />
              </div>
            );
          })}
          {topComments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">첫 댓글을 남겨보세요!</p>
          )}
        </div>
      </div>
    </div>
  );
}
