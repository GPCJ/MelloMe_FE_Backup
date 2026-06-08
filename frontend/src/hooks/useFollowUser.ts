import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFollowStatus, followUser, unfollowUser } from '../api/follow';

// 단일 유저 팔로우 상태 + 토글 (게시글 상세/댓글 작성자 드롭다운용).
// 상태 조회는 enabled일 때만(드롭다운이 열렸을 때만) 호출 → 댓글 N개여도 연 것만 요청.
export function useFollowUser(targetUserId: number, enabled: boolean) {
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['follow-status', targetUserId],
    queryFn: () => getFollowStatus(targetUserId),
    enabled,
    staleTime: 30_000,
  });

  const following = statusQuery.data?.following ?? false;

  async function toggle() {
    if (pending) return;
    setPending(true);
    const wasFollowing = following;
    try {
      const fresh = wasFollowing
        ? await unfollowUser(targetUserId)
        : await followUser(targetUserId);
      // 단일 상태 캐시 갱신 + 카운트 동기화.
      // 목록(['follow'])은 강제 무효화하지 않는다 — 정책 A(언팔해도 행 유지) 일관성.
      // 목록 경로(useFollowToggle)도 카운트만 동기화하므로 두 경로를 동일하게 맞춤.
      qc.setQueryData(['follow-status', targetUserId], fresh);
      qc.invalidateQueries({ queryKey: ['follow-counts'] });
      toast(fresh.following ? '팔로우했어요' : '팔로우를 취소했어요');
    } catch (err) {
      console.error('[follow]', err);
      toast.error('처리에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setPending(false);
    }
  }

  return { following, isLoading: statusQuery.isLoading, toggle, pending };
}
