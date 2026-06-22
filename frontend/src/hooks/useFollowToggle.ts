import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { followUser, unfollowUser } from '../api/follow';
import type { FollowUser } from '../types/follow';

// 팔로잉 탭 행 단위 낙관적 팔로우/언팔 토글.
// 댓글 리액션 B패턴(useCommentReactionToggle)을 목록 행에 맞게 변형.
export function useFollowToggle() {
  const qc = useQueryClient();
  // 이번 세션에서 언팔된 userId 집합. 비어있음 = 전원 팔로잉(팔로잉 탭 초기 상태).
  const [unfollowed, setUnfollowed] = useState<Set<number>>(new Set());
  const [pendingId, setPendingId] = useState<number | null>(null);

  const isFollowing = (userId: number) => !unfollowed.has(userId);

  function applyUnfollow(userId: number, shouldUnfollow: boolean) {
    setUnfollowed((prev) => {
      const next = new Set(prev);
      if (shouldUnfollow) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }

  async function toggle(user: FollowUser) {
    if (pendingId !== null) return; // 한 번에 한 행만
    const userId = user.userId;
    const currentlyFollowing = isFollowing(userId);
    setPendingId(userId);

    // 낙관적 반영: 팔로잉이면 언팔, 아니면 재팔로우
    applyUnfollow(userId, currentlyFollowing);

    try {
      const fresh = currentlyFollowing
        ? await unfollowUser(userId)
        : await followUser(userId);
      // 서버 응답으로 reconcile (following=false → 언팔 상태로 고정)
      applyUnfollow(userId, !fresh.following);
      qc.invalidateQueries({ queryKey: ['follow-counts'] });
      qc.invalidateQueries({ queryKey: ['feed-following'] });
    } catch (err) {
      // 롤백: 낙관적 반영을 되돌림
      applyUnfollow(userId, !currentlyFollowing);
      console.error('[follow]', err);
      toast.error('처리에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setPendingId(null);
    }
  }

  return { isFollowing, toggle, pendingId };
}
