import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  MessageSquare,
  MoreHorizontal,
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
import PageHeader from '@/components/common/PageHeader';
import { trackReaction } from '../../lib/analytics';
import axios from 'axios';
import { useCommentReactionToggle } from '../../hooks/useCommentReactionToggle';

// 가로 드래그 스크롤 — 작성 모달(PostWriteForm)과 동일 패턴.
// mousedown에서 시작점(scrollLeft+pageX) 캡쳐 → mousemove에서 그 차이만큼 scrollLeft 갱신.
// state.current.moved는 다음 click 흡수 가드용 — 드래그 거리 > 5px면 우연한 클릭(다운로드 등) 무시.
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const handlers = {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      state.current = { active: true, startX: e.pageX, startScroll: el.scrollLeft, moved: 0 };
      el.style.cursor = 'grabbing';
    },
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || !state.current.active) return;
      const dx = e.pageX - state.current.startX;
      el.scrollLeft = state.current.startScroll - dx;
      state.current.moved = Math.abs(dx);
    },
    onMouseUp: () => {
      if (ref.current) ref.current.style.cursor = '';
      state.current.active = false;
    },
    onMouseLeave: () => {
      if (ref.current) ref.current.style.cursor = '';
      state.current.active = false;
    },
  };
  return { ref, state, handlers };
}

function PostDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-8">
      {/* PageHeader 자리 — 시각 점프 방지용 흰 영역 */}
      <div className="h-14 bg-white" />
      <div className="bg-gray-200 flex flex-col gap-px">
        <div className="bg-white p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
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

  // 첨부 이미지 가로 드래그 캐러셀 — 시안 정합: 작성 모달과 동일 패턴.
  const imagesScroll = useDragScroll();

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
      .catch((err) => {
        // 비인증 회원이 인증 전용 게시글에 직접 진입(/posts/:id) 시 백엔드는 403을 내려보냄.
        // 목록 카드 블러는 PostCard가 처리하지만, URL 직접 진입은 페이지 단위에서 인증 페이지로 redirect.
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          navigate('/therapist-verifications', { replace: true });
          return;
        }
        setError('게시글을 불러오는 데 실패했습니다.');
      })
      .finally(() => setLoading(false));
  }, [postId, navigate]);

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
    <div className="max-w-3xl mx-auto pb-20 md:pb-8">
      {/* 상단 헤더 */}
      <PageHeader title="게시글" backTo={`/posts`} />

      {/* 시안: 흰 카드를 회색 컨테이너 + gap-px로 묶어 카드 사이 1px 회색 띠로 분리 */}
      <div className="bg-gray-200 flex flex-col gap-px">
        {/* 게시글 카드 */}
        <div className="bg-white p-4 flex flex-col gap-4">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-3">
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
                <span className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
            {/* 수정·삭제 케밥 — 시안: 게시글 카드 작성자 라인 우측 가로 점 3개 */}
            {(post.canEdit || post.canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="게시글 메뉴"
                  className="p-1.5 shrink-0 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <MoreHorizontal size={20} />
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
            )}
          </div>

          {/* 해시태그 */}
          {therapyLabel && (
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                #{therapyLabel}
              </span>
            </div>
          )}

          {/* 본문 — accessLocked 분기는 fetch 단계에서 4xx redirect로 처리되어 일반적으론 도달 X.
            백엔드가 향후 4xx 대신 마스킹 응답으로 바뀔 가능성을 대비해 방어적으로 유지. */}
          {post.accessLocked ? (
            <div className="bg-stone-50 rounded-lg py-12 px-4">
              <p className="text-center text-gray-600 text-sm">
                인증된 회원에게만 공개된 게시물입니다.
              </p>
            </div>
          ) : (
            <div
              className="post-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />
          )}

          {/* 첨부파일 + 이미지 */}
          {((post.attachments && post.attachments.length > 0) || images.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                첨부파일 ({(post.attachments?.length ?? 0) + images.length})
              </h3>
              {/* 이미지: 가로 드래그 캐러셀 — 시안 정합(작성 모달과 동일 패턴).
                  -mx-4 px-4: 카드 좌우 패딩(p-4)을 무시하고 가장자리까지 스크롤 영역 확장. */}
              {images.length > 0 && (
                <div
                  ref={imagesScroll.ref}
                  {...imagesScroll.handlers}
                  className="flex gap-2 overflow-x-auto -mx-4 px-4 cursor-grab select-none mb-2"
                >
                  {images.map((img) => (
                    <div key={`img-${img.id}`} className="shrink-0 w-72 flex flex-col">
                      <img
                        crossOrigin="anonymous"
                        src={resolveImageUrl(img.imageUrl) ?? ''}
                        alt={img.originalFilename}
                        draggable={false}
                        className="w-72 h-72 rounded-lg object-cover bg-gray-100 mb-2"
                      />
                      <a
                        href={resolveImageUrl(img.imageUrl) ?? '#'}
                        download={img.originalFilename}
                        onClick={(e) => {
                          // 드래그 종료점이 링크 위일 때 우연한 다운로드 방지.
                          if (imagesScroll.state.current.moved > 5) {
                            e.preventDefault();
                            return;
                          }
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
                </div>
              )}
              {/* 비이미지 첨부(PDF 등) — 기존 세로 리스트 유지. 이미지 타입 첨부도 동일 경로. */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  {post.attachments.map((att) => {
                    const isImage = att.contentType.startsWith('image/');
                    return (
                      <div key={att.id}>
                        {isImage && (
                          <img
                            crossOrigin="anonymous"
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
              )}
            </div>
          )}

          {/* 리액션 + 댓글 수 — 시안: 댓글 좌측 끝, 북마크 우측 끝 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/posts/${postId}/comments`)}
              className="flex md:hidden items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MessageSquare size={16} />
              {visibleCommentCount}
            </button>
            <span className="hidden md:flex items-center gap-1.5 text-sm text-gray-400">
              <MessageSquare size={16} />
              {visibleCommentCount}
            </span>
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
              onClick={handleScrapToggle}
              disabled={scrapLoading}
              className="p-1.5 shrink-0 ml-auto transition-colors"
            >
              <Bookmark
                size={20}
                className={
                  scrapped ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-500'
                }
              />
            </button>
          </div>
        </div>

        {/* 댓글 헤더 + 데스크탑 인라인 입력 — 풀폭 흰 카드 1개 */}
        <div className="bg-white p-4">
          <h2 className="text-base font-bold text-gray-900">댓글 {visibleCommentCount}</h2>
          <div className="hidden md:block mt-4">
            <CommentInput
              value={commentInput}
              onChange={setCommentInput}
              onSubmit={() => handleSubmitComment(commentInput)}
              submitting={submitting}
            />
          </div>
        </div>

        {/* 댓글 카드 — 옵션 A(메인 통합): 부모 댓글 + 그 자식들을 한 번에 렌더.
            기존엔 외부 래퍼 div onClick으로 카드 클릭 → CommentDetailPage 이동이었으나,
            시안 정합을 위해 카드 자체 navigate를 제거. 답글 작성 동선은 카드 내부
            💬 아이콘(onMessageClick) → CommentDetailPage 진입으로 유지(D-4 안전).
            isReply/hasReplies는 다음 UI 커밋에서 좌측 컬럼 세로선/꺾인 선 prefix에 사용. */}
        {topComments.flatMap((parent) => {
          const replies = getReplies(parent.id);
          const parentEditing = editingCommentId === parent.id;
          return [
            <CommentCard
              key={parent.id}
              comment={parent}
              replyCount={replies.length}
              isReply={false}
              hasReplies={replies.length > 0}
              onMessageClick={() =>
                navigate(`/posts/${postId}/comments/${parent.id}`, {
                  state: { autoReply: true },
                })
              }
              onDelete={() => handleDeleteComment(parent.id)}
              isEditing={parentEditing}
              editSubmitting={editSubmitting}
              onEditStart={() => handleEditStart(parent.id)}
              onEditSubmit={(newContent) => handleEditSubmit(parent.id, newContent)}
              onEditCancel={handleEditCancel}
              onToggleReaction={(type) => handleCommentToggle(parent.id, type)}
              toggling={togglingId === parent.id}
            />,
            ...replies.map((reply) => {
              const replyEditing = editingCommentId === reply.id;
              return (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  replyToNickname={parent.authorNickname}
                  isReply={true}
                  hasReplies={false}
                  onMessageClick={() =>
                    navigate(`/posts/${postId}/comments/${parent.id}`, {
                      state: { autoReply: true, replyToCommentId: reply.id },
                    })
                  }
                  onDelete={() => handleDeleteComment(reply.id)}
                  isEditing={replyEditing}
                  editSubmitting={editSubmitting}
                  onEditStart={() => handleEditStart(reply.id)}
                  onEditSubmit={(newContent) => handleEditSubmit(reply.id, newContent)}
                  onEditCancel={handleEditCancel}
                  onToggleReaction={(type) => handleCommentToggle(reply.id, type)}
                  toggling={togglingId === reply.id}
                />
              );
            }),
          ];
        })}
        {topComments.length === 0 && (
          <div className="bg-white py-12 text-center text-sm text-gray-400">
            첫 댓글을 남겨보세요!
          </div>
        )}
      </div>
    </div>
  );
}
