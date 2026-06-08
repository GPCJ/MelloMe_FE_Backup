import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import NarrowPage from '../../components/common/NarrowPage';
import UserAvatar from '../../components/common/UserAvatar';
import { fetchFollowings, fetchFollowers } from '../../api/follow';
import { useFollowToggle } from '../../hooks/useFollowToggle';
import type { FollowUser, PagedFollowUsers } from '../../types/follow';

const PAGE_SIZE = 10;
type Tab = 'followings' | 'followers';

// role enum → 한국어 라벨. 미지의 값은 원문 노출(방어적).
const ROLE_LABEL: Record<string, string> = {
  THERAPIST: '치료사',
  ADMIN: '관리자',
  USER: '회원',
};

export default function FollowListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'followers' ? 'followers' : 'followings';

  const { isFollowing, toggle, pendingId } = useFollowToggle();

  const query = useInfiniteQuery({
    queryKey: ['follow', tab],
    queryFn: ({ pageParam }) =>
      tab === 'followings'
        ? fetchFollowings(pageParam, PAGE_SIZE)
        : fetchFollowers(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PagedFollowUsers) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  });

  const users: FollowUser[] = query.data?.pages.flatMap((p) => p.items) ?? [];

  function switchTab(next: Tab) {
    if (next === tab) return;
    setSearchParams({ tab: next });
  }

  return (
    <NarrowPage>
      <PageHeader title="팔로우" backTo="/profile" />

      {/* 팔로잉/팔로워 탭 — 쪽지함과 동일 컨벤션 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex">
          {(
            [
              ['followings', '팔로잉'],
              ['followers', '팔로워'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => switchTab(value)}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
                tab === value ? 'text-neutral-950 border-b-2 border-black' : 'text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-sm text-destructive">목록을 불러오지 못했어요.</p>
          <button
            onClick={() => query.refetch()}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            재시도
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">
          {tab === 'followings'
            ? '아직 팔로우한 치료사가 없어요'
            : '아직 나를 팔로우한 사람이 없어요'}
        </div>
      ) : (
        <>
          <ul>
            {users.map((u) => (
              <li
                key={u.userId}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
              >
                <UserAvatar nickname={u.nickname} imageUrl={u.profileImageUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.nickname}</p>
                  <p className="text-xs text-gray-400">{ROLE_LABEL[u.role] ?? u.role}</p>
                </div>
                {/* 팔로잉 탭만 토글 버튼. 팔로워 탭은 명단 표시만(맞팔 버튼=backlog F-12) */}
                {tab === 'followings' && (
                  <button
                    onClick={() => toggle(u)}
                    disabled={pendingId === u.userId}
                    className={`group w-[72px] text-center text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                      isFollowing(u.userId)
                        ? 'bg-gray-900 text-white border-gray-900 hover:bg-white hover:text-gray-700 hover:border-gray-300'
                        : 'text-gray-500 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {isFollowing(u.userId) ? (
                      <>
                        {/* 기본 "팔로잉", 호버 시 빨간 "언팔로우"로 전환 — 실수 언팔 방지(의도 명확화) */}
                        <span className="group-hover:hidden">팔로잉</span>
                        <span className="hidden group-hover:inline">언팔로우</span>
                      </>
                    ) : (
                      '팔로우'
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {query.hasNextPage && (
            <div className="flex justify-center py-4">
              <button
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {query.isFetchingNextPage ? '불러오는 중...' : '더보기'}
              </button>
            </div>
          )}
        </>
      )}
    </NarrowPage>
  );
}
