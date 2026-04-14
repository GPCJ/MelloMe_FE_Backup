import { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { fetchFeed } from '../api/posts';
import type { PostSummary } from '../types/post';

interface UseInfiniteFeedOptions {
  size?: number;
  enabled?: boolean;
  initialSnapshot?: {
    items: PostSummary[];
    nextCursor: string | null;
    hasNext: boolean;
  };
}

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

export function useInfiniteFeed(
  options: UseInfiniteFeedOptions = {},
): UseInfiniteFeedResult {
  const { size = 20, enabled = true, initialSnapshot } = options;

  const [items, setItems] = useState<PostSummary[]>(
    initialSnapshot?.items ?? [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialSnapshot?.nextCursor ?? null,
  );
  const [hasNext, setHasNext] = useState<boolean>(
    initialSnapshot?.hasNext ?? true,
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    !initialSnapshot && enabled,
  );
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflightRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (cursor: string | null, isInitial: boolean) => {
      if (inflightRef.current) inflightRef.current.abort();
      const controller = new AbortController();
      inflightRef.current = controller;
      const myId = ++requestIdRef.current;

      if (isInitial) setIsLoading(true);
      else setIsFetchingMore(true);
      setError(null);

      try {
        const data = await fetchFeed({
          size,
          ...(cursor ? { cursor } : {}),
          signal: controller.signal,
        });
        if (requestIdRef.current !== myId) return;
        setItems((prev) => (isInitial ? data.items : [...prev, ...data.items]));
        setNextCursor(data.nextCursor);
        setHasNext(data.hasNext);
      } catch (err) {
        if (requestIdRef.current !== myId) return;
        if (isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        setError('피드를 불러오는 데 실패했습니다.');
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
    if (!enabled) return;
    if (itemsLengthRef.current > 0) return;
    fetchPage(null, true);
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
