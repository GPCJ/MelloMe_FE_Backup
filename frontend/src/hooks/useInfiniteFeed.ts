import { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { fetchFeed } from '../api/posts';
import type { PostSummary } from '../types/post';

// useInfiniteFeed훅의 파라미터 타입 인터페이스
interface UseInfiniteFeedOptions {
  size?: number;
  enabled?: boolean; // 이게 뭐하는거지?
  initialSnapshot?: {
    // 스크롤 위치 기억을 위해서 쓰는건가?
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

export function useInfiniteFeed(options: UseInfiniteFeedOptions = {}): UseInfiniteFeedResult {
  // 구조 분해? 여튼 그거 써서 파라미터들을 변수로 선언, 그런데 size하고 enabled는 상수네?
  const { size = 20, enabled = true, initialSnapshot } = options;

  const [items, setItems] = useState<PostSummary[]>(initialSnapshot?.items ?? []);
  const [nextCursor, setNextCursor] = useState<string | null>(initialSnapshot?.nextCursor ?? null);
  const [hasNext, setHasNext] = useState<boolean>(initialSnapshot?.hasNext ?? true);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSnapshot && enabled);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflightRef = useRef<AbortController | null>(null); // 이전 요청 취소를 위한 Ref변수
  const requestIdRef = useRef(0);
  const onErrorRef = useRef(options.onError);
  onErrorRef.current = options.onError;

  // 여기가 레이스 컨디션 관리하면서 데이터 불러오는 함수
  const fetchPage = useCallback(
    // isInitial은 추축이긴 하지만 처음 불러오는 페이지에 대한 정보라면 true인 것 같음 = yes
    async (cursor: string | null, isInitial: boolean) => {
      // if문 조건 설명: 이전 요청이 있다면?(truthy)
      // 이전 요청이 있으면 abort실행
      if (inflightRef.current) inflightRef.current.abort();
      const controller = new AbortController();
      inflightRef.current = controller;
      const myId = ++requestIdRef.current; // requestIdRef.current의 초기값은 0이라고함 number타입이고(정확히는 number가 아니긴 한데 제너럴로 number타입만 받음)

      if (isInitial)
        setIsLoading(true); // 이 코드가 실행된다는 것은 서버에서 처음으로 클라이언트가 불러오는 페이지라는 뜻
      else setIsFetchingMore(true); // 그러면 처음 가져오는 페이지 정보인지 아닌지는 어떻게 판단하는거지?
      setError(null);

      try {
        const data = await fetchFeed({
          size,
          // 처음에는 cursor가 null일수 있기 때문에 null이라 ?연산자에 걸리면 cursor는 뺴고 size만 쿼리 파라미터로 요청을 보냄
          ...(cursor ? { cursor } : {}),
          signal: controller.signal,
        });
        // 이 두 값이 같지 않다는 것은 무슨 뜻이지? -> fetchPage함수가 실행된
        if (requestIdRef.current !== myId) return;
        setItems((prev) => (isInitial ? data.items : [...prev, ...data.items]));
        setNextCursor(data.nextCursor);
        setHasNext(data.hasNext);
      } catch (err) {
        if (requestIdRef.current !== myId) return;
        if (isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        setError('피드를 불러오는 데 실패했습니다.');
        onErrorRef.current?.();
      } finally {
        if (requestIdRef.current === myId) {
          if (isInitial) setIsLoading(false);
          else setIsFetchingMore(false);
        }
      }
    },
    [size],
  );

  const itemsLengthRef = useRef(items.length);
  itemsLengthRef.current = items.length;

  useEffect(() => {
    // enabled이 flase라면? 즉, 무한스크롤 모드가 OFF 상태라면 fetchPage를 건너뛰고 useEffect 종료
    if (!enabled) return;
    // 이미 요청중인 요청이 있다면(itemsLengthRef.current의 값이 1이상) return
    if (itemsLengthRef.current > 0) return;
    // 첫 로딩이라는 뜻
    fetchPage(null, true);

    // 클린업으로 이전 요청을 abort진행
    return () => {
      inflightRef.current?.abort();
    };
  }, [enabled, fetchPage]);

  const loadMore = useCallback(() => {
    if (isLoading || isFetchingMore || !hasNext || error) return;
    fetchPage(nextCursor, false);
  }, [isLoading, isFetchingMore, hasNext, error, nextCursor, fetchPage]);

  const retry = useCallback(() => {
    setError(null);
    fetchPage(nextCursor, items.length === 0);
  }, [nextCursor, items.length, fetchPage]);

  return {
    items,
    isLoading,
    isFetchingMore,
    error,
    hasNext,
    nextCursor,
    loadMore,
    retry,
  };
}
