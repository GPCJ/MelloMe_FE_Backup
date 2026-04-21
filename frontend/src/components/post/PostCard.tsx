import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MessageCircle, Heart, Lock } from 'lucide-react';
import type { PostSummary } from '../../types/post';
import { formatRelativeTime } from '../../utils/formatDate';
import { scrapPost, unscrapPost } from '../../api/posts';
import VerifiedBadge from './VerifiedBadge';
import { useReactionToggle } from '../../hooks/useReactionToggle';
import UserAvatar from '../common/UserAvatar';

interface PostCardProps {
  post: PostSummary;
}

export default function PostCard({ post }: PostCardProps) {
  // TODO: 자신의 게시물에 스크랩 못하도록 차단
  // - PostSummary에 authorId 추가 백엔드 요청 필요
  // - authorId === currentUserId이면 스크랩 버튼 숨김 처리
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
      }
      setScrapped(!scrapped);
    } catch {
      // TODO: 에러 토스트 추가
    } finally {
      setScrapLoading(false);
    }
  };

  // 카드는 LIKE 1종만 노출 (백엔드 명세 2026-04-21). myReactionType은 PostSummary에
  // 포함되지 않아 새로고침 시 active 강조가 초기화됨 — 낙관적 토글만 유지.
  const { reaction, toggling, handleToggle } = useReactionToggle({
    postId: post.id,
    likeCount: post.likeCount ?? 0,
    curiousCount: 0,
    usefulCount: 0,
    myReactionType: null,
  });

  return (
    <Link to={`/posts/${post.id}`} className="block">
      <div className="px-6 py-5 border-b border-gray-200">
        {/* 1행: 프로필 + 닉네임 + 인증뱃지 + 시간 + 북마크 */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <UserAvatar
            nickname={post.authorNickname}
            imageUrl={post.authorProfileImageUrl}
            size="xs"
          />
          <span className="text-sm font-medium text-neutral-950">
            {post.authorNickname}
          </span>
          <VerifiedBadge status={post.authorVerificationStatus} />
          <span className="text-[11px] text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </span>
          {post.visibility === 'PRIVATE' && (
            <span
              className="inline-flex items-center text-gray-500"
              aria-label="치료사 전용 게시글"
              title="치료사 전용 게시글"
            >
              <Lock size={12} />
            </span>
          )}
          <button
            type="button"
            onClick={handleScrapToggle}
            disabled={scrapLoading}
            className="ml-auto"
          >
            <Bookmark
              size={16}
              className={
                scrapped ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }
            />
          </button>
        </div>

        {/* 2행: 본문 미리보기 또는 블러 */}
        {post.isBlurred ? (
          <div className="bg-stone-50 rounded-lg py-6 px-4 mb-2.5">
            <p className="text-center text-gray-600 text-xs">
              인증된 회원에게만 공개된 게시물입니다.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-5 line-clamp-3 mb-2.5">
            {post.contentPreview}
          </p>
        )}

        {/* 4행: 첨부파일 */}
        {post.hasAttachment && (
          <p className="text-[10px] text-gray-900 mb-2.5">첨부파일 있음</p>
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
            <Heart
              size={16}
              fill={
                reaction?.myReactionType === 'LIKE' ? 'currentColor' : 'none'
              }
            />
            {/* 디자이너 결정(2026-04-21): 카운트가 0이면 아이콘만 표시 */}
            {(reaction?.likeCount ?? 0) > 0 && (
              <span className="text-xs">{reaction?.likeCount}</span>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
