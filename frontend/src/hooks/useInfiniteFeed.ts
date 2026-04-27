import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeed } from '../api/posts';
import type { PostSummary } from '../types/post';

// useInfiniteFeed훅의 파라미터 타입 인터페이스
// (R-01b 마이그레이션 전/후 동일 — PostListPage 호출부 변경 없음)
interface UseInfiniteFeedOptions {
  size?: number;
  enabled?: boolean; // 무한 스크롤 모드 ON/OFF (필터/팔로잉 탭에서는 false → 페이지네이션 모드)
  initialSnapshot?: {
    // 뒤로가기 시 Zustand에 저장된 상태 복원용 (스크롤 위치 + 이미 로드된 아이템들)
    items: PostSummary[];
    nextCursor: string | null;
    hasNext: boolean;
  };
  onError?: () => void;
}

// useInfiniteFeed훅의 반환값 타입 인터페이스
interface UseInfiniteFeedResult {
  items: PostSummary[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  hasNext: boolean;
  nextCursor: string | null;
  loadMore: () => void;
  retry: () => void;
}

/**
 * 무한 스크롤 피드 훅 (React Query useInfiniteQuery 기반).
 *
 * v1(E패턴: useState + AbortController + requestIdRef) → v2(RQ) 마이그레이션 결과물입니다.
 * 인터페이스는 v1과 동일하므로 PostListPage 호출부는 그대로입니다.
 *
 * RQ 캐시 구조 (책 은유):
 *   data = {
 *     pages:      [page0, page1, page2, ...]   ← 펼친 페이지 내용들 (queryFn 리턴값)
 *     pageParams: [null,  'c_x', 'c_y', ...]   ← 각 페이지를 펼칠 때 사용한 책갈피(cursor)
 *   }
 * 항상 pages.length === pageParams.length 불변량을 지킵니다.
 */
export function useInfiniteFeed(options: UseInfiniteFeedOptions = {}): UseInfiniteFeedResult {
  const { size = 20, enabled = true, initialSnapshot } = options;

  // onError 콜백을 ref로 보관합니다.
  // 이유: RQ v5에서 useQuery의 onError 옵션이 제거되었습니다.
  // 대신 useEffect(query.isError) 패턴을 쓰는데, 의존성 배열에 부모가 매 렌더마다
  // 새로 만든 함수를 직접 넣으면 isError가 그대로여도 effect가 재실행되어 어색합니다.
  // ref로 감싸면 "최신 콜백을 단순 호출"하는 의도가 명확해집니다.
  const onErrorRef = useRef(options.onError);
  onErrorRef.current = options.onError;

  // 스냅샷을 RQ initialData 모양으로 변환합니다.
  // useMemo로 객체 동일성을 유지해 매 렌더마다 캐시가 재초기화되는 것을 막습니다.
  // pages는 길이 1짜리 배열(page0 = 스냅샷 한 페이지),
  // pageParams는 [null] (첫 페이지는 cursor 없이 펼쳤다는 뜻 — initialPageParam과 일치).
  const initialData = useMemo(() => {
    if (!initialSnapshot) return undefined;
    return {
      pages: [
        {
          items: initialSnapshot.items,
          nextCursor: initialSnapshot.nextCursor,
          hasNext: initialSnapshot.hasNext,
        },
      ],
      pageParams: [null] as (string | null)[],
    };
  }, [initialSnapshot]);

  const query = useInfiniteQuery({
    // 캐시 주소 — size가 바뀌면 별개 쿼리(별개 캐시 슬롯)가 됩니다.
    queryKey: ['feed', { size }],
    // RQ가 호출하는 실제 페치 함수.
    // signal은 RQ가 자동으로 만들어 주는 AbortSignal입니다.
    // 컴포넌트 언마운트 / queryKey 변경 / queryClient.cancelQueries() 호출 시
    // RQ가 알아서 abort 하므로, v1의 inflightRef + AbortController 수동 관리가 사라집니다.
    queryFn: ({ pageParam, signal }) =>
      fetchFeed({
        size,
        ...(pageParam ? { cursor: pageParam } : {}),
        signal,
      }),
    // 첫 페이지의 책갈피 — null = "처음부터" (cursor 쿼리 파라미터 없음).
    initialPageParam: null as string | null,
    // 다음 페이지의 책갈피 계산.
    // undefined를 리턴하면 RQ가 hasNextPage=false로 자동 잠급니다.
    // (v1에서 setHasNext로 수동 관리하던 것을 RQ가 흡수)
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled,
    initialData,
    // 자동 refetch를 모두 끕니다 — v1 동작과 일치시키기 위함입니다.
    // - staleTime: Infinity — 캐시를 절대 stale로 표시하지 않음 → 마운트/포커스/리커넥트 시 재요청 안 함
    //   (특히 initialData가 있는 경우, default staleTime=0이면 RQ가 마운트 직후 백그라운드 refetch를 시도해
    //    스냅샷이 덮여 스크롤 복원 위치의 아이템이 바뀔 수 있습니다 — 이를 차단)
    // - refetchOnWindowFocus: false — 명시적으로 한 번 더 차단 (defensive)
    // 결과: 명시적인 fetchNextPage / refetch 호출만 네트워크를 일으킵니다.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // RQ v5는 onError 콜백 옵션이 없으므로, isError 변화 감지 → 폴백 콜백 발화로 대응합니다.
  // PostListPage는 이 콜백을 받아 feedFailed=true로 만들어 페이지네이션 모드로 폴백합니다 (P1 fallback).
  useEffect(() => {
    if (query.isError) onErrorRef.current?.();
  }, [query.isError]);

  // pages "책"의 각 페이지 items를 한 줄로 펼칩니다.
  // 예: [{items:[a,b]}, {items:[c,d]}] → [a,b,c,d]
  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  // RQ가 자동 계산한 hasNextPage를 그대로 사용합니다.
  // (getNextPageParam이 undefined를 리턴한 마지막 페이지에 도달하면 false)
  const hasNext = query.hasNextPage ?? false;
  // 외부 노출용 — 마지막 페이지의 cursor (다음에 사용할 책갈피).
  // fetchNextPage 호출에는 필요 없지만, v1 인터페이스 호환을 위해 유지합니다.
  const nextCursor = query.data?.pages.at(-1)?.nextCursor ?? null;

  // sentinel observer가 호출하는 추가 페치 트리거.
  // 가드: 첫 로딩 중 / 추가 페이지 로딩 중 / 마지막 페이지 / 에러 상태에서는 무시합니다.
  // (v1과 동일한 가드 로직)
  const loadMore = useCallback(() => {
    if (
      query.isLoading ||
      query.isFetchingNextPage ||
      !hasNext ||
      query.isError
    ) {
      return;
    }
    query.fetchNextPage();
  }, [
    query.isLoading,
    query.isFetchingNextPage,
    hasNext,
    query.isError,
    query.fetchNextPage,
  ]);

  // "재시도" 버튼이 호출하는 함수.
  // v1 동작 보존:
  //   - 아직 한 페이지도 못 받았으면 처음부터 다시 (refetch)
  //   - 이미 일부 페이지는 받았고 다음 페이지에서 실패한 거라면 그 다음 페이지만 재시도 (fetchNextPage)
  // 주의: RQ의 refetch()는 모든 페이지를 처음부터 다시 가져오므로,
  //      "이미 받은 N개 페이지를 버리지 않는다"는 의미로 fetchNextPage 분기를 둡니다.
  const retry = useCallback(() => {
    if (items.length === 0) {
      query.refetch();
    } else {
      query.fetchNextPage();
    }
  }, [items.length, query.refetch, query.fetchNextPage]);

  return {
    items,
    // v1 isLoading "초기 스켈레톤 띄울 때" ≡ v5 isLoading (isPending && isFetching).
    isLoading: query.isLoading,
    // v1 isFetchingMore ≡ v5 isFetchingNextPage.
    isFetchingMore: query.isFetchingNextPage,
    error: query.isError ? '피드를 불러오는 데 실패했습니다.' : null,
    hasNext,
    nextCursor,
    loadMore,
    retry,
  };
}
