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

  // X 스타일 더보기: line-clamp-3으로 잘리는 경우에만 버튼 노출.
  // truncated 측정은 축약 상태 기준이라야 의미가 있어 expanded=false일 때만 수행.
  // ResizeObserver로 감싸 폰트/이미지 로딩·뷰포트 변경에 따른 레이아웃 변동도 재측정.
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);
  useLayoutEffect(() => {
    if (expanded) return;
    const el = contentRef.current;
    if (!el) return;
    // +1: subpixel 반올림 오차 가드
    const measure = () => setTruncated(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [post.contentPreview, expanded]);

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
          <>
            <p
              ref={contentRef}
              className={`text-sm text-gray-600 leading-5 whitespace-pre-wrap break-words mb-2.5 ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {post.contentPreview}
            </p>
            {truncated && !expanded && (
              <button
                type="button"
                onClick={(e) => {
                  // 카드 전체가 Link라 펼침 클릭이 라우팅으로 새지 않도록 차단.
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded(true);
                }}
                className="-mt-1 mb-2.5 text-xs text-gray-500 hover:text-gray-700"
              >
                더 보기
              </button>
            )}
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
        )}

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
