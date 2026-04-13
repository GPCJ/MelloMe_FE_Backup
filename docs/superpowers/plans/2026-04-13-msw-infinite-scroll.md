# MSW 환경 무한 스크롤 구현 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PostListPage에 커서 기반 무한 스크롤을 MSW mock으로 선구현한다. 백엔드 CORS 해결 시 MSW만 끄면 그대로 동작해야 한다.

**Architecture:** PostListPage가 `therapyArea` 유무로 분기 — 필터 없으면 `useInfiniteFeed` 훅(`/posts/feed` 커서) + IntersectionObserver, 있으면 기존 offset 페이지네이션 fallback. 스크롤 위치 + 누적 데이터 + cursor를 Zustand store에 저장해 뒤로가기 시 복원.

**Tech Stack:** React 19, TypeScript, Zustand, MSW, IntersectionObserver, axios

**Spec:** `.omc/specs/deep-interview-msw-infinite-scroll.md`

**원칙:**
- 작은 단위 commit (Task = 1 commit)
- 각 Task 끝 브라우저 수동 검증 → 사용자에게 진행 상황 보고
- 단위 테스트 없음 (Non-Goal). 검증은 dev server에서 실제 클릭으로 확인

---

## File Structure

| 파일 | 역할 | 작업 |
|---|---|---|
| `frontend/src/types/post.ts` | `CursorPagedPosts` 타입, `PostSummary.popularityScore` 추가 | 수정 |
| `frontend/src/api/posts.ts` | `fetchFeed(params)` 함수 추가 | 수정 |
| `frontend/src/mocks/handlers/posts.handlers.ts` | `GET /posts/feed` 핸들러 추가 (런타임 60개 생성, base64 cursor) | 수정 |
| `frontend/src/hooks/useInfiniteFeed.ts` | 무한 스크롤 훅 (items/loadMore/retry) | 신규 |
| `frontend/src/stores/feedScrollStore.ts` | Zustand, 스냅샷 저장/복원 (TTL 5분) | 신규 |
| `frontend/src/pages/post/PostListPage.tsx` | 필터 분기 + sentinel + 카드 클릭 시 스냅샷 저장 | 수정 |

---

## Task 1: 타입 정의

**Files:**
- Modify: `frontend/src/types/post.ts`

- [ ] **Step 1: PostSummary에 popularityScore 추가 (optional)**

`frontend/src/types/post.ts`의 `PostSummary` 인터페이스에 한 줄 추가:

```ts
export interface PostSummary {
  id: number;
  postType?: PostType;
  contentPreview?: string;
  authorNickname: string;
  authorProfileImageUrl?: string | null;
  authorVerificationStatus?: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  therapyArea?: TherapyArea;
  visibility?: Visibility;
  viewCount: number;
  popularityScore?: number;     // ← 추가
  commentCount?: number;
  hasAttachment?: boolean;
  isBlurred?: boolean;
  createdAt: string;
  scrapped?: boolean;
}
```

- [ ] **Step 2: CursorPagedPosts 타입 추가**

`PaginatedPosts` 인터페이스 바로 아래에 추가:

```ts
export interface CursorPagedPosts {
  items: PostSummary[];
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
}
```

- [ ] **Step 3: 타입 체크**

```bash
cd frontend && npx tsc -b
```
Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
cd /home/jin24/my-project
git add frontend/src/types/post.ts
git commit -m "feat(types): add CursorPagedPosts + popularityScore field"
```

- [ ] **Step 5: 사용자 보고**

"Task 1 완료. 타입 정의 추가됨. 다음(Task 2: API client)으로 진행할까요?"

---

## Task 2: API client (fetchFeed)

**Files:**
- Modify: `frontend/src/api/posts.ts`

- [ ] **Step 1: fetchFeed 함수 추가**

`frontend/src/api/posts.ts` 상단 import에 `CursorPagedPosts` 추가:

```ts
import type {
  PaginatedPosts,
  CursorPagedPosts,        // ← 추가
  PostDetail,
  // ... 나머지 그대로
} from '../types/post';
```

`fetchPosts` 함수 바로 아래에 추가:

```ts
export async function fetchFeed(params: {
  cursor?: string;
  size?: number;
  sort?: 'LATEST' | 'POPULAR';
  signal?: AbortSignal;
}): Promise<CursorPagedPosts> {
  const { signal, ...query } = params;
  const res = await axiosInstance.get('/posts/feed', { params: query, signal });
  return res.data?.data ?? res.data;
}
```

**주의:** 백엔드 응답이 `{ success, data: { items, ... } }` 형태이므로 `res.data?.data ?? res.data`로 unwrap. fallback은 MSW에서 wrapper 없이 보낼 수도 있어서 양쪽 호환.

- [ ] **Step 2: 타입 체크**

```bash
cd frontend && npx tsc -b
```
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
cd /home/jin24/my-project
git add frontend/src/api/posts.ts
git commit -m "feat(api): add fetchFeed for cursor-based pagination"
```

- [ ] **Step 4: 사용자 보고**

"Task 2 완료. fetchFeed 추가. 다음(Task 3: MSW 핸들러)으로 진행할까요?"

---

## Task 3: MSW 핸들러 (`GET /posts/feed`)

**Files:**
- Modify: `frontend/src/mocks/handlers/posts.handlers.ts`

- [ ] **Step 1: 모듈 상단에 mock feed 데이터 생성기 추가**

`frontend/src/mocks/handlers/posts.handlers.ts` 파일 상단(import 아래)에 추가:

```ts
// 무한 스크롤 검증용 — 60개 가짜 피드 데이터 (모듈 캐싱)
const FEED_TOTAL = 60;
const therapyAreas = ['UNSPECIFIED', 'SPEECH', 'PLAY', 'COGNITIVE', 'OCCUPATIONAL', 'BEHAVIOR'] as const;
const mockFeedItems = Array.from({ length: FEED_TOTAL }, (_, i) => {
  const id = FEED_TOTAL - i;  // 60, 59, 58, ... 1 (최신순)
  return {
    id,
    postType: 'COMMUNITY' as const,
    contentPreview: `[목업 ${id}] 무한 스크롤 검증용 게시글입니다. 스크롤하면 다음 페이지가 자동으로 로드됩니다.`,
    authorNickname: `테스트치료사${(id % 5) + 1}`,
    therapyArea: therapyAreas[id % therapyAreas.length],
    visibility: 'PUBLIC' as const,
    viewCount: 100 + id * 3,
    popularityScore: 20 + (id % 10) * 1.5,
    createdAt: new Date(2026, 3, 13, 12, 0, 0, -id * 60_000).toISOString(),
    scrapped: false,
  };
});

function encodeCursor(lastId: number): string {
  return btoa(JSON.stringify({ lastId }));
}

function decodeCursor(cursor: string): number | null {
  try {
    const parsed = JSON.parse(atob(cursor));
    return typeof parsed.lastId === 'number' ? parsed.lastId : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: `postsHandlers` 배열에 GET /posts/feed 핸들러 추가**

`postsHandlers` 배열 안, 기존 `http.get(`${API}/posts`, ...)` 바로 아래에 추가:

```ts
  http.get(`${API}/posts/feed`, ({ request }) => {
    const url = new URL(request.url);
    const rawSize = Number(url.searchParams.get('size') ?? '20');
    const size = Math.min(50, Math.max(1, isNaN(rawSize) ? 20 : rawSize));
    const cursor = url.searchParams.get('cursor');

    let startIdx = 0;
    if (cursor) {
      const lastId = decodeCursor(cursor);
      if (lastId === null) {
        return HttpResponse.json(
          { success: false, code: 'INVALID_INPUT', message: 'invalid cursor' },
          { status: 400 },
        );
      }
      const idx = mockFeedItems.findIndex((p) => p.id === lastId);
      startIdx = idx === -1 ? mockFeedItems.length : idx + 1;
    }

    const slice = mockFeedItems.slice(startIdx, startIdx + size);
    const hasNext = startIdx + size < mockFeedItems.length;
    const nextCursor = hasNext && slice.length > 0
      ? encodeCursor(slice[slice.length - 1].id)
      : null;

    return HttpResponse.json({
      success: true,
      data: {
        items: slice,
        nextCursor,
        hasNext,
        size,
      },
    });
  }),
```

- [ ] **Step 3: 브라우저 검증**

```bash
cd frontend && npm run dev
```
백그라운드로 실행. 다른 터미널에서:

```bash
curl 'http://localhost:5173/api/v1/posts/feed?size=5'
```
(또는 브라우저 DevTools Network 탭에서 직접 확인)

Expected: `success: true, data.items` 길이 5, `data.hasNext: true`, `data.nextCursor`가 base64 문자열

다음 호출:
```bash
curl 'http://localhost:5173/api/v1/posts/feed?size=5&cursor=<위에서받은nextCursor>'
```
Expected: 다음 5개, 마지막 페이지에서 `hasNext: false`, `nextCursor: null`

- [ ] **Step 4: 타입 체크**

```bash
cd frontend && npx tsc -b
```
Expected: 에러 없음

- [ ] **Step 5: Commit**

```bash
cd /home/jin24/my-project
git add frontend/src/mocks/handlers/posts.handlers.ts
git commit -m "feat(msw): add cursor-based GET /posts/feed mock handler"
```

- [ ] **Step 6: 사용자 보고**

"Task 3 완료. MSW 핸들러로 60개 mock 피드 + base64 cursor 동작 확인. 다음(Task 4: useInfiniteFeed 훅)으로 진행할까요?"

---

## Task 4: `useInfiniteFeed` 훅

**Files:**
- Create: `frontend/src/hooks/useInfiniteFeed.ts`

- [ ] **Step 1: 훅 작성**

`frontend/src/hooks/useInfiniteFeed.ts` 신규 파일:

```ts
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

export function useInfiniteFeed(options: UseInfiniteFeedOptions = {}): UseInfiniteFeedResult {
  const { size = 20, enabled = true, initialSnapshot } = options;

  const [items, setItems] = useState<PostSummary[]>(initialSnapshot?.items ?? []);
  const [nextCursor, setNextCursor] = useState<string | null>(initialSnapshot?.nextCursor ?? null);
  const [hasNext, setHasNext] = useState<boolean>(initialSnapshot?.hasNext ?? true);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSnapshot && enabled);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflightRef = useRef<AbortController | null>(null);
  const hasInitializedRef = useRef<boolean>(!!initialSnapshot);

  const fetchPage = useCallback(
    async (cursor: string | null, isInitial: boolean) => {
      if (inflightRef.current) inflightRef.current.abort();
      const controller = new AbortController();
      inflightRef.current = controller;

      if (isInitial) setIsLoading(true);
      else setIsFetchingMore(true);
      setError(null);

      try {
        const data = await fetchFeed({
          size,
          ...(cursor ? { cursor } : {}),
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setItems((prev) => (isInitial ? data.items : [...prev, ...data.items]));
        setNextCursor(data.nextCursor);
        setHasNext(data.hasNext);
      } catch (err) {
        if (isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        setError('피드를 불러오는 데 실패했습니다.');
      } finally {
        if (!controller.signal.aborted) {
          if (isInitial) setIsLoading(false);
          else setIsFetchingMore(false);
        }
      }
    },
    [size],
  );

  useEffect(() => {
    if (!enabled) return;
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
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

  return { items, isLoading, isFetchingMore, error, hasNext, nextCursor, loadMore, retry };
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend && npx tsc -b
```
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
cd /home/jin24/my-project
git add frontend/src/hooks/useInfiniteFeed.ts
git commit -m "feat(hook): add useInfiniteFeed for cursor-based infinite scroll"
```

- [ ] **Step 4: 사용자 보고**

"Task 4 완료. 훅 작성. 단독 검증은 다음 Task에서 페이지에 통합 후 수행. 다음(Task 5: 스크롤 복원 store)으로 진행할까요?"

---

## Task 5: `feedScrollStore` (Zustand)

**Files:**
- Create: `frontend/src/stores/feedScrollStore.ts`

- [ ] **Step 1: store 작성**

`frontend/src/stores/feedScrollStore.ts` 신규 파일:

```ts
import { create } from 'zustand';
import type { PostSummary } from '../types/post';

const TTL_MS = 5 * 60 * 1000;

interface FeedSnapshot {
  items: PostSummary[];
  nextCursor: string | null;
  hasNext: boolean;
  scrollY: number;
  savedAt: number;
}

interface FeedScrollState {
  snapshot: FeedSnapshot | null;
  save: (snapshot: Omit<FeedSnapshot, 'savedAt'>) => void;
  consume: () => FeedSnapshot | null;  // 한 번 읽고 자동 폐기
  clear: () => void;
}

export const useFeedScrollStore = create<FeedScrollState>((set, get) => ({
  snapshot: null,
  save: (snapshot) => set({ snapshot: { ...snapshot, savedAt: Date.now() } }),
  consume: () => {
    const snap = get().snapshot;
    if (!snap) return null;
    if (Date.now() - snap.savedAt > TTL_MS) {
      set({ snapshot: null });
      return null;
    }
    set({ snapshot: null });
    return snap;
  },
  clear: () => set({ snapshot: null }),
}));
```

**설계 노트:**
- `consume`은 한 번 읽으면 자동 폐기 → "뒤로가기 1회만 복원" 의도
- TTL 5분 — 너무 길면 새 글이 있을 때 stale 데이터 보임
- 새로고침 시 메모리 휘발 → 자동으로 처음부터 로드 (의도된 동작, spec과 일치)

- [ ] **Step 2: 타입 체크**

```bash
cd frontend && npx tsc -b
```
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
cd /home/jin24/my-project
git add frontend/src/stores/feedScrollStore.ts
git commit -m "feat(store): add feedScrollStore for scroll position restoration"
```

- [ ] **Step 4: 사용자 보고**

"Task 5 완료. 복원 store 작성. 다음(Task 6: PostListPage 통합)으로 진행할까요?"

---

## Task 6: PostListPage 통합

**Files:**
- Modify: `frontend/src/pages/post/PostListPage.tsx`

> **이 Task는 가장 큼.** 변경 범위가 크므로 단계별로 천천히 따라가세요. 각 step 끝에 빌드 확인.

- [ ] **Step 1: import 추가**

`frontend/src/pages/post/PostListPage.tsx` 상단 import에 추가:

```ts
import { useEffect, useRef, useState } from 'react';   // useRef 추가
// ... 기존 imports
import { useInfiniteFeed } from '@/hooks/useInfiniteFeed';
import { useFeedScrollStore } from '@/stores/feedScrollStore';
```

- [ ] **Step 2: 컴포넌트 안에서 mode 분기 + 무한 스크롤 훅 호출**

`PostListPage` 함수 안, 기존 `useState` 선언들 바로 아래에 추가:

```ts
  const isInfiniteMode = !therapyArea && activeTab === 'all';

  const consumeSnapshot = useFeedScrollStore((s) => s.consume);
  const saveSnapshot = useFeedScrollStore((s) => s.save);
  const initialSnapshotRef = useRef<ReturnType<typeof consumeSnapshot>>(null);
  if (initialSnapshotRef.current === null && isInfiniteMode) {
    initialSnapshotRef.current = consumeSnapshot();
  }

  const infinite = useInfiniteFeed({
    size: 20,
    enabled: isInfiniteMode,
    initialSnapshot: initialSnapshotRef.current
      ? {
          items: initialSnapshotRef.current.items,
          nextCursor: initialSnapshotRef.current.nextCursor,
          hasNext: initialSnapshotRef.current.hasNext,
        }
      : undefined,
  });
```

- [ ] **Step 3: 스크롤 위치 복원 effect 추가**

위 코드 바로 아래에 추가:

```ts
  useEffect(() => {
    if (!isInfiniteMode) return;
    const snap = initialSnapshotRef.current;
    if (!snap) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: snap.scrollY, behavior: 'instant' as ScrollBehavior });
    });
  }, [isInfiniteMode]);
```

- [ ] **Step 4: 기존 offset useEffect 가드 — 무한 스크롤 모드일 때는 호출 안 함**

기존 `useEffect`의 첫 줄을 수정:

```ts
  useEffect(() => {
    if (activeTab !== 'all') return;
    if (isInfiniteMode) return;     // ← 추가: 무한 스크롤 모드는 별도 처리
    setLoading(true);
    // ... 나머지 그대로
  }, [therapyArea, currentPage, activeTab, isInfiniteMode]);  // ← deps에 isInfiniteMode 추가
```

- [ ] **Step 5: IntersectionObserver sentinel 설정**

위 effect 바로 아래에 추가:

```ts
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isInfiniteMode) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          infinite.loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isInfiniteMode, infinite.loadMore]);
```

- [ ] **Step 6: 카드 클릭 시 스냅샷 저장 핸들러**

위 effect 바로 아래에 추가:

```ts
  function handleCardClick() {
    if (!isInfiniteMode) return;
    saveSnapshot({
      items: infinite.items,
      nextCursor: infinite.nextCursor,
      hasNext: infinite.hasNext,
      scrollY: window.scrollY,
    });
  }
```

- [ ] **Step 7: 렌더링 부분 — 무한 스크롤/offset 분기**

기존 렌더링 부분 중 `{activeTab === 'all' ? (` 안의 `<div className="bg-white">` 블록을 다음으로 교체:

```tsx
      {activeTab === 'all' ? (
        <div className="bg-white">
          {isInfiniteMode ? (
            <>
              {infinite.isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                  ))
                : infinite.items.map((post) => (
                    <div key={post.id} onClickCapture={handleCardClick}>
                      <PostCard post={post} />
                    </div>
                  ))}

              {infinite.isFetchingMore &&
                Array.from({ length: 2 }).map((_, i) => (
                  <PostCardSkeleton key={`more-${i}`} />
                ))}

              {infinite.error && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-sm text-destructive">{infinite.error}</p>
                  <button
                    onClick={infinite.retry}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    재시도
                  </button>
                </div>
              )}

              {!infinite.isLoading && !infinite.error && infinite.items.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">아직 게시글이 없어요.</p>
                  <Link
                    to="/posts/new"
                    className={buttonVariants({ size: 'sm' }) + ' gap-1'}
                  >
                    <Plus size={15} />첫 글 작성하기
                  </Link>
                </div>
              )}

              {!infinite.isLoading && !infinite.hasNext && infinite.items.length > 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  마지막 글이에요
                </p>
              )}

              <div ref={sentinelRef} aria-hidden className="h-1" />
            </>
          ) : (
            <>
              {error && (
                <p
                  className={`text-center py-12 ${error === '공개 게시물이 없습니다.' ? 'text-gray-400' : 'text-destructive'}`}
                >
                  {error}
                </p>
              )}

              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                  ))
                : data?.items.map((post) => <PostCard key={post.id} post={post} />)}

              {!loading && !error && data?.items.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">아직 게시글이 없어요.</p>
                  <Link
                    to="/posts/new"
                    className={buttonVariants({ size: 'sm' }) + ' gap-1'}
                  >
                    <Plus size={15} />첫 글 작성하기
                  </Link>
                </div>
              )}

              {!loading && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      ) : (
```

- [ ] **Step 8: 타입 체크**

```bash
cd frontend && npx tsc -b
```
Expected: 에러 없음. 에러 나면 import 누락이나 deps 수정.

- [ ] **Step 9: 브라우저 수동 검증 — Acceptance Criteria 전체**

```bash
cd frontend && npm run dev
```

브라우저에서 다음 시나리오 차례로 확인:

**A-1. 첫 로드:**
- `/posts` 진입 → 첫 20개 카드 표시 → "마지막 글이에요" 표시 안 됨

**A-2. 스크롤 append:**
- 아래로 스크롤 → sentinel 진입 → Skeleton 잠깐 → 다음 20개 추가 → 누적 40개

**A-3. 끝 도달:**
- 끝까지 스크롤 → 60개 표시 → "마지막 글이에요" 표시

**A-4. 재시도:**
- DevTools Network 탭에서 `/posts/feed`를 throttle 또는 block → loadMore 트리거 → 인라인 "재시도" 버튼 표시 → block 해제 → 재시도 클릭 → 정상 로드

**C-1. 스크롤 복원:**
- 30개쯤 로드 후 중간 카드 클릭 → 상세 페이지 → 브라우저 뒤로가기 → 스크롤 위치 + 누적된 30개 + 다음 cursor 그대로 → 추가 스크롤 시 다음 페이지 정상 호출

**C-2. 필터 모드 전환:**
- 필터 칩 (예: SPEECH) 클릭 → offset 페이지네이션 모드 전환 → 하단에 페이지 번호 노출 → "마지막 글이에요" 사라짐
- 필터 해제 → 무한 스크롤 모드 복귀 → 처음부터 로드

각 시나리오에서 동작이 다르면 Step 1~7 다시 확인.

- [ ] **Step 10: Commit**

```bash
cd /home/jin24/my-project
git add frontend/src/pages/post/PostListPage.tsx
git commit -m "feat(post): integrate infinite scroll with filter-mode hybrid + scroll restore"
```

- [ ] **Step 11: 사용자 보고**

"Task 6 완료. 모든 acceptance criteria 시나리오 동작 확인. 무한 스크롤 구현 완료. 작업 후 리마인드 항목 정리해드릴까요?"

---

## Task 7: 작업 후 리마인드 정리

- [ ] **Step 1: 사용자에게 별도 PR 후보 리마인드**

다음 항목들을 메시지로 정리해서 사용자에게 전달:

**B. 검증 추가 (별도 PR)**
- 빠른 스크롤 시 중복 호출 없음 (in-flight 가드 검증)
- 마지막 페이지 도달 후 추가 호출 안 함

**D. 운영급 UX (별도 PR)**
- 401 / 네트워크 에러 / 400 별 분기 UX
- 빈 피드 (items 0개) 일러스트
- 새 글 작성 직후 mock에 즉시 반영

**E. 자동화 (별도 PR)**
- `useInfiniteFeed` Vitest + RTL 단위 테스트
- IntersectionObserver mock 패턴 확립

**Mock 정확도 (별도 PR)**
- visibility 권한별 mock — `currentUserEmail` 기반 THERAPIST/ADMIN이면 PRIVATE 포함

**디자이너 협의 필요**
- 정렬 토글 UI (LATEST/POPULAR) — 본 작업 완료 후 디자이너에게 시안 요청
  - "전체 피드/팔로우" 탭과의 시각적 위계
  - sort별 스크롤 복원 정책 (store 키 확장)
  - 정렬 전환 시 cursor 리셋 + items 비우기 로직 (가이드 함정)

**백엔드 협의**
- `/posts/feed`에 `therapyArea` 필터 파라미터 추가 요청 → 받으면 하이브리드 분기 제거
- CORS 해결 후 실제 엔드포인트로 검증

- [ ] **Step 2: 메모리 업데이트 권유**

`/wrap-up` 또는 직접 메모리에 무한 스크롤 구현 완료 사실 + 리마인드 항목 저장 권유

---

## 자체 검토 결과

- ✅ Spec의 모든 acceptance criteria(A-1~A-3, C-1~C-2) Task 6 Step 9에 검증 시나리오 1:1 매칭
- ✅ Spec File Structure의 6개 파일 모두 Task로 커버
- ✅ MSW mock 정책 4개 (1c/2a/3a/4b) 모두 Task 3에 반영
- ✅ Non-Goals 준수: 단위 테스트 없음, 정렬 UI 없음, visibility 권한 단순화
- ✅ Type 일관성: `PostSummary` (기존 타입) 사용, `CursorPagedPosts` 신규
- ✅ 각 Task = 1 commit, 마지막에 "사용자 보고" step으로 진행 상황 공유
- ✅ 플레이스홀더 없음, 모든 코드 블록 실제 실행 가능
