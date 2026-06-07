import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MessageCircle, Heart, Lock } from 'lucide-react';
import type { PostSummary, PostReaction } from '../../types/post';
import { formatRelativeTime } from '../../utils/formatDate';
import { scrapPost, unscrapPost } from '../../api/posts';
import VerifiedBadge from './VerifiedBadge';
import { useReactionToggle } from '../../hooks/useReactionToggle';
import { useDragScroll } from '../../hooks/useDragScroll';
import UserAvatar from '../common/UserAvatar';
import { trackReaction } from '../../lib/analytics';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import { parseContentPreview } from '../../utils/contentPreview';
import ConcernCard from './ConcernCard';

interface PostCardProps {
  post: PostSummary;
  onReactionUpdated?: (fresh: PostReaction) => void;
}

export default function PostCard({ post, onReactionUpdated }: PostCardProps) {
  const [scrapped, setScrapped] = useState(post.scrapped ?? false);
  const [scrapLoading, setScrapLoading] = useState(false);

  const handleScrapToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scrapLoading) return;
    setScrapLoading(true);
    try {
      if (scrapped) {
        await unscrapPost(post.id);
      } else {
        await scrapPost(post.id);
        // KPI "반응 수"는 신규 스크랩만 카운트 — 해제 시는 발송 안 함.
        trackReaction('scrap', { postId: post.id });
      }
      setScrapped(!scrapped);
    } catch {
      // TODO: 에러 토스트 추가
    } finally {
      setScrapLoading(false);
    }
  };

  const { reaction, toggling, handleToggle } = useReactionToggle(
    // initialReaction
    {
      postId: post.id,
      likeCount: post.likeCount ?? 0,
      curiousCount: 0,
      usefulCount: 0,
      myReactionType: post.myReactionType,
    },
    // onUpdated
    onReactionUpdated,
  );

  const imagesScroll = useDragScroll();

  // "더보기" 신호 = 백엔드 생략(글자수) ∥ 프론트 5줄 오버플로. 둘을 OR로 합쳐 단일 신호로 노출.
  // 백엔드 "..." 표식은 어댑터에서 떼어내(중복 회피) backendTruncated로 승격, 본문은 표식 없는 text 렌더.
  // overflowed 측정은 프론트 클램프 잘림 판단용. ResizeObserver로 폰트/이미지 로딩·뷰포트 변경 재측정.
  const { text: previewText, backendTruncated } = parseContentPreview(post.contentPreview);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [overflowed, setOverflowed] = useState(false);
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // +1: subpixel 반올림 오차 가드
    const measure = () => setOverflowed(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewText]);
  const showMore = backendTruncated || overflowed;

  return (
    <Link
      to={post.accessLocked ? '/therapist-verifications' : `/posts/${post.id}`}
      draggable={false}
      className="block"
    >
      <div className="px-6 py-5 border-b border-gray-200">
        {/* 1행: 프로필 + 닉네임 + 인증뱃지 + 시간 + 북마크 */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <UserAvatar
            nickname={post.authorNickname}
            imageUrl={post.authorProfileImageUrl}
            size="xs"
          />
          <span className="text-sm font-medium text-neutral-950">{post.authorNickname}</span>
          <VerifiedBadge status={post.authorVerificationStatus} />
          <span className="text-[11px] text-gray-500">{formatRelativeTime(post.createdAt)}</span>
          <button
            type="button"
            onClick={handleScrapToggle}
            disabled={scrapLoading}
            className="ml-auto"
          >
            <Bookmark
              size={16}
              className={scrapped ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          </button>
        </div>

        {/* 2행: 본문 + 첨부파일 (비인증 차단 시 블러 + 안내 오버레이) */}
        {post.accessLocked ? (
          <div className="relative mb-2.5">
            <div className="blur-[5.8px] opacity-50 pointer-events-none select-none">
              <p className="text-sm text-[#4a5565] leading-5 line-clamp-3 whitespace-pre-wrap mb-2.5">
                {post.contentPreview}
              </p>
              {post.hasAttachment && <p className="text-[10px] text-gray-900">첨부파일 있음</p>}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center gap-[4px] w-[270px]">
                <Lock size={18} className="text-black" />
                <span className="text-[11px] text-black leading-[20px]">
                  치료사 인증 후에 볼 수 있어요!
                </span>
              </div>
            </div>
          </div>
        ) : (
          post.postType === 'CONCERN_CARD' ? (
            <ConcernCard
              ageGroup={post.ageGroup}
              therapyArea={post.therapyArea}
              diagnoses={post.diagnoses}
              otherNotes={post.otherNotes}
              body={post.contentPreview}
              clamp={true}
            />
          ) : (
          <>
            {/* 본문 5줄 클램프 + 잘릴 때 6번째 줄에 "... 더보기" 신호.
                높이 기반 클램프(max-h 100px = leading-5 20px × 5)로 자른다 —
                line-clamp의 자동 "…"가 6줄째 "... 더보기"와 중복되므로 의도적으로 회피.
                신호일 뿐 — 클릭은 카드 전체 Link가 상세로 흡수(별도 onClick 없음). */}
            <div className="mb-2.5">
              <p
                ref={contentRef}
                className="text-sm text-gray-600 leading-5 whitespace-pre-wrap break-words max-h-[100px] overflow-hidden"
              >
                {previewText}
              </p>
              {showMore && (
                <p className="text-sm text-gray-400 leading-5">... 더보기</p>
              )}
            </div>
            {/* 첨부 이미지 캐러셀 — staging 응답의 imageUrls 사용. 가드: 있을 때만 렌더. */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div
                ref={imagesScroll.ref}
                {...imagesScroll.handlers}
                onDragStart={(e) => e.preventDefault()}
                // 드래그 종료 시 click이 부모 Link로 버블링되어 상세 진입되는 현상 흡수.
                onClickCapture={(e) => {
                  if (imagesScroll.state.current.moved > 5) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                className="flex gap-2 overflow-x-auto -mx-6 px-6 mb-2.5 cursor-grab select-none"
              >
                {post.imageUrls.map((url, i) => (
                  <img
                    key={`${post.id}-img-${i}`}
                    crossOrigin="anonymous"
                    src={resolveImageUrl(url) ?? ''}
                    alt=""
                    draggable={false}
                    className="shrink-0 w-60 h-60 rounded-lg object-cover bg-gray-100"
                  />
                ))}
              </div>
            )}
            {post.hasAttachment && (
              <p className="text-[10px] text-gray-900 mb-2.5">첨부파일 있음</p>
            )}
          </>
        ))}

        {/* 4행: 댓글 수 + 공감 */}
        <div className="flex items-center gap-3 text-gray-400">
          <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
            <MessageCircle size={14} />
            {post.commentCount ?? 0}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggle('LIKE');
            }}
            disabled={toggling}
            aria-label="좋아요"
            className={`flex items-center gap-1 text-sm transition-colors ${
              reaction?.myReactionType === 'LIKE'
                ? 'text-red-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart size={16} fill={reaction?.myReactionType === 'LIKE' ? 'currentColor' : 'none'} />
            {(reaction?.likeCount ?? 0) > 0 && (
              <span className="text-xs">{reaction?.likeCount}</span>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
