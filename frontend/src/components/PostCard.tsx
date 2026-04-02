import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MessageCircle, Eye } from 'lucide-react';
import type { PostSummary, PostReaction, ReactionType } from '../types/post';
import { THERAPY_AREA_LABELS } from '../constants/post';
import { formatRelativeTime } from '../utils/formatDate';
import VerifiedBadge from './VerifiedBadge';
import ReactionBar from './ReactionBar';
import { toggleReaction } from '../api/posts';

// 목데이터 — 백엔드 태그 필드 구현 전까지 사용
const MOCK_HASHTAGS: Record<string, string[]> = {};

interface PostCardProps {
  post: PostSummary;
}

function ProfileAvatar({
  nickname,
  imageUrl,
}: {
  nickname: string;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={nickname}
        className="w-5 h-5 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
      <span className="text-white text-[8px] font-medium">{nickname[0]}</span>
    </div>
  );
}

export default function PostCard({ post }: PostCardProps) {
  const therapyLabel =
    post.therapyArea && post.therapyArea !== 'UNSPECIFIED'
      ? THERAPY_AREA_LABELS[post.therapyArea]
      : null;

  const hashtags = MOCK_HASHTAGS[post.id] ?? (therapyLabel ? [`#${therapyLabel}`] : []);

  // 리액션 로컬 상태 (목데이터 — 백엔드 API 반환값으로 교체 예정)
  const [reaction, setReaction] = useState<PostReaction>({
    postId: post.id,
    empathyCount: 0,
    appreciateCount: 0,
    helpfulCount: 0,
    myReactionType: null,
  });
  const [toggling, setToggling] = useState(false);

  async function handleToggle(type: ReactionType) {
    if (toggling) return;
    setToggling(true);

    const wasActive = reaction.myReactionType === type;
    const countKey = type === 'EMPATHY' ? 'empathyCount' : type === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount';

    // 낙관적 업데이트
    const prev = { ...reaction };
    setReaction({
      ...reaction,
      myReactionType: wasActive ? null : type,
      [countKey]: reaction[countKey] + (wasActive ? -1 : 1),
      // 이전 리액션이 있었고 다른 타입으로 변경 시 이전 카운트 감소
      ...(reaction.myReactionType && !wasActive && reaction.myReactionType !== type
        ? {
            [reaction.myReactionType === 'EMPATHY' ? 'empathyCount' : reaction.myReactionType === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount']:
              reaction[reaction.myReactionType === 'EMPATHY' ? 'empathyCount' : reaction.myReactionType === 'APPRECIATE' ? 'appreciateCount' : 'helpfulCount'] - 1,
          }
        : {}),
    });

    try {
      await toggleReaction(post.id, type);
    } catch {
      setReaction(prev);
    } finally {
      setToggling(false);
    }
  }

  return (
    <Link to={`/posts/${post.id}`} className="block">
      <div className="px-6 py-5 border-b border-gray-200">
        {/* 1행: 프로필 + 닉네임 + 인증뱃지 + 시간 + 북마크 */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <ProfileAvatar
            nickname={post.authorNickname}
            imageUrl={post.authorProfileImageUrl}
          />
          <span className="text-sm font-medium text-neutral-950">
            {post.authorNickname}
          </span>
          <VerifiedBadge status={post.authorVerificationStatus} />
          <span className="text-[11px] text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO: 스크랩 API 연동
            }}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <Bookmark size={16} />
          </button>
        </div>

        {/* 2행: 해시태그 */}
        {hashtags.length > 0 && (
          <div className="flex gap-2 mb-2.5">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full border border-gray-900 text-[11px] font-medium text-gray-900"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 3행: 본문 미리보기 또는 블러 */}
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

        {/* 5행: 리액션 + 댓글 수 + 조회수 */}
        <div className="flex items-center gap-3 text-gray-500">
          <ReactionBar
            reaction={reaction}
            onToggle={handleToggle}
            disabled={toggling}
          />
          <span className="flex items-center gap-1 text-xs font-medium ml-auto">
            <MessageCircle size={14} />
            {post.commentCount ?? 0}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium">
            <Eye size={14} />
            {post.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
