import { useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobPosts } from '../api/jobPosts';
import type { JobPostListParams, JobPostSummary } from '../types/jobPost';

// 구인공고 전용 무한 스크롤 훅.
// 전체/팔로우 피드의 useInfiniteFeed는 PostSummary/CursorPagedPosts에 강결합돼 있어 일반화 대신
// 동일 패턴(useInfiniteQuery + cursor)을 별도로 둔다. 스냅샷 복원은 Phase 1 범위 밖(미지원).
type Filters = Pick<JobPostListParams, 'status' | 'therapyArea' | 'region' | 'employmentType'>;

interface UseInfiniteJobPostsResult {
  items: JobPostSummary[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  hasNext: boolean;
  loadMore: () => void;
  retry: () => void;
}

export function useInfiniteJobPosts(filters: Filters, size = 10): UseInfiniteJobPostsResult {
  const query = useInfiniteQuery({
    queryKey: ['job-posts', { ...filters, size }],
    queryFn: ({ pageParam, signal }) =>
      fetchJobPosts({ ...filters, cursor: pageParam ?? undefined, size, signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : undefined),
    retry: false,
    staleTime: 30_000,
  });

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const hasNext = query.hasNextPage ?? false;

  const loadMore = useCallback(() => {
    if (query.isLoading || query.isFetchingNextPage || !hasNext || query.isError) return;
    query.fetchNextPage();
  }, [query.isLoading, query.isFetchingNextPage, hasNext, query.isError, query.fetchNextPage]);

  return {
    items,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    error: query.isError ? '구인공고를 불러오는 데 실패했습니다.' : null,
    hasNext,
    loadMore,
    retry: () => query.refetch(),
  };
}
