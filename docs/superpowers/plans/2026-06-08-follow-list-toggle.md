# 팔로우 목록 + 언팔로우 토글 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/follow` 페이지(팔로잉/팔로워 2탭, "더보기" 페이지네이션) + 팔로잉 탭 행별 언팔로우 토글 + ProfilePage 헤더 팔로우 카운트 진입점을 구현한다.

**Architecture:** 신규 4파일(types/api/hook/page) + ProfilePage·App.tsx 변경. 목록은 RQ `useInfiniteQuery`(offset, "더보기"), 카운트는 `useQuery`, 토글은 페이지-레벨 낙관적 상태(언팔된 userId Set) + 응답 reconcile + 실패 롤백(sonner 토스트). 기존 패턴(`NarrowPage`/`PageHeader`/`UserAvatar`/쪽지함 탭) 재사용.

**Tech Stack:** React 19 + TS, React Router(`useSearchParams`), TanStack Query(`useInfiniteQuery`/`useQuery`), Tailwind, sonner(toast), axios(`axiosInstance` + envelope 인터셉터).

**검증 방식 주의:** 이 프로젝트엔 **단위 테스트 러너가 없다**(vitest/jest 미설치). 각 태스크의 검증 = `npx tsc -b` 타입체크 통과 + 마지막 태스크의 브라우저 수동 검증. 테스트 프레임워크를 새로 도입하지 않는다(스코프·의존성 규율).

**설계 문서:** `docs/superpowers/specs/2026-06-08-follow-list-toggle-design.md`

---

## 파일 구조

| 파일 | 책임 | 신규/변경 |
|---|---|---|
| `frontend/src/types/follow.ts` | 팔로우 도메인 타입 4종 | 신규 |
| `frontend/src/api/follow.ts` | 팔로우 엔드포인트 호출 + envelope 언랩 | 신규 |
| `frontend/src/hooks/useFollowToggle.ts` | 팔로잉 탭 행별 낙관적 토글 | 신규 |
| `frontend/src/pages/follow/FollowListPage.tsx` | `/follow` 페이지(탭/목록/더보기/토글) | 신규 |
| `frontend/src/App.tsx` | `/follow` 라우트 등록 | 변경 |
| `frontend/src/pages/profile/ProfilePage.tsx` | 헤더 팔로우 카운트(실데이터+링크) | 변경 |

---

## Task 0: 피처 브랜치 생성

**Files:** 없음(브랜치만)

- [ ] **Step 1: develop 최신화 후 브랜치 분기**

Run:
```bash
cd /home/jin24/MelloMe_FE_Backup
git checkout develop && git pull
git checkout -b feat/follow-list
```
Expected: `Switched to a new branch 'feat/follow-list'`

---

## Task 1: 팔로우 타입 정의

**Files:**
- Create: `frontend/src/types/follow.ts`

- [ ] **Step 1: 타입 파일 작성**

`frontend/src/types/follow.ts`:
```ts
// 팔로우 목록 행 — /me/followings, /me/followers 공유 DTO.
// 주의: 백엔드 FollowUserResponse에는 "내가 이 사람을 팔로우 중인가"(following) 필드가 없다.
//       팔로워 탭 맞팔 버튼은 그래서 이번 슬라이스 제외(backlog F-12).
export interface FollowUser {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
  role: string;
}

// POST/DELETE/GET /users/{userId}/follow 응답.
export interface FollowStatus {
  userId: number;
  following: boolean;
}

// GET /me/follow-counts 응답.
export interface FollowCount {
  followerCount: number;
  followingCount: number;
}

// offset 페이지 응답 (커서 아님 — page/totalPages/hasNext).
export interface PagedFollowUsers {
  items: FollowUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
```

- [ ] **Step 2: 타입체크**

Run: `cd frontend && npx tsc -b`
Expected: 에러 없이 통과(미사용 타입은 export라 경고 없음).

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/types/follow.ts
git commit -m "feat(follow): 팔로우 도메인 타입 정의"
```

---

## Task 2: 팔로우 API 함수

**Files:**
- Create: `frontend/src/api/follow.ts`

- [ ] **Step 1: API 파일 작성**

`frontend/src/api/follow.ts`:
```ts
import axiosInstance from './axiosInstance';
import type { FollowCount, PagedFollowUsers, FollowStatus } from '../types/follow';

// 응답 인터셉터(axiosInstance.ts:35-40)가 {success,data}를 data로 언랩하지만,
// 최신 형제 모듈(api/messages.ts)과 동일하게 방어적으로 한 번 더 언랩한다.
export async function fetchFollowCounts(): Promise<FollowCount> {
  const res = await axiosInstance.get('/me/follow-counts');
  return res.data?.data ?? res.data;
}

export async function fetchFollowings(page = 0, size = 10): Promise<PagedFollowUsers> {
  const res = await axiosInstance.get('/me/followings', { params: { page, size } });
  return res.data?.data ?? res.data;
}

export async function fetchFollowers(page = 0, size = 10): Promise<PagedFollowUsers> {
  const res = await axiosInstance.get('/me/followers', { params: { page, size } });
  return res.data?.data ?? res.data;
}

export async function followUser(userId: number): Promise<FollowStatus> {
  const res = await axiosInstance.post(`/users/${userId}/follow`);
  return res.data?.data ?? res.data;
}

export async function unfollowUser(userId: number): Promise<FollowStatus> {
  const res = await axiosInstance.delete(`/users/${userId}/follow`);
  return res.data?.data ?? res.data;
}
```

> 참고: `getFollowStatus(GET /users/{id}/follow)`는 이번 슬라이스에서 미사용이라 YAGNI로 생략. 백로그 F-12(맞팔 버튼) 착수 시 추가.

- [ ] **Step 2: 타입체크**

Run: `cd frontend && npx tsc -b`
Expected: 통과.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/api/follow.ts
git commit -m "feat(follow): 팔로우 API 함수 (counts/목록/POST/DELETE)"
```

---

## Task 3: 토글 훅 `useFollowToggle`

**Files:**
- Create: `frontend/src/hooks/useFollowToggle.ts`

설계: 팔로잉 탭은 로드 시 전원 `following=true`이므로, "이번 세션에서 언팔된 userId"만 `Set`으로 추적한다(기본=팔로잉). 낙관적 반영 → 응답 `following`으로 reconcile → 실패 시 롤백. 단일 in-flight 가드.

- [ ] **Step 1: 훅 파일 작성**

`frontend/src/hooks/useFollowToggle.ts`:
```ts
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
```

- [ ] **Step 2: 타입체크**

Run: `cd frontend && npx tsc -b`
Expected: 통과(`FollowUser` import 사용됨).

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/hooks/useFollowToggle.ts
git commit -m "feat(follow): 낙관적 언팔/팔로우 토글 훅"
```

---

## Task 4: `/follow` 페이지 + 라우트

**Files:**
- Create: `frontend/src/pages/follow/FollowListPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 페이지 작성**

`frontend/src/pages/follow/FollowListPage.tsx`:
```tsx
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
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                      isFollowing(u.userId)
                        ? 'text-gray-500 border-gray-300 hover:border-gray-400'
                        : 'bg-gray-900 text-white border-gray-900'
                    }`}
                  >
                    {isFollowing(u.userId) ? '팔로잉' : '팔로우'}
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
```

- [ ] **Step 2: 라우트 등록**

`frontend/src/App.tsx` — 상단 import 추가(다른 페이지 import들과 같은 위치):
```tsx
import FollowListPage from './pages/follow/FollowListPage';
```

그리고 `AuthRoute` + `Layout` 안, `/profile` 라우트 바로 아래에 추가:
```tsx
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/follow" element={<FollowListPage />} />
```

- [ ] **Step 3: 타입체크**

Run: `cd frontend && npx tsc -b`
Expected: 통과.

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/pages/follow/FollowListPage.tsx frontend/src/App.tsx
git commit -m "feat(follow): 팔로우 목록 페이지(팔로잉/팔로워 탭 + 더보기 + 언팔 토글) + 라우트"
```

---

## Task 5: ProfilePage 헤더 팔로우 카운트 진입점

**Files:**
- Modify: `frontend/src/pages/profile/ProfilePage.tsx`

현재 `ProfilePage.tsx:255-265`에 하드코딩 "팔로워 0 · 팔로잉 0" 블록이 있다. 이를 실데이터 + 클릭 링크로 교체한다.

- [ ] **Step 1: import 추가**

`frontend/src/pages/profile/ProfilePage.tsx` 상단 — `api/auth` import 줄 근처에 추가:
```tsx
import { fetchFollowCounts } from '../../api/follow';
```
(`useQuery`, `useNavigate`는 이미 import되어 있으므로 추가 불필요.)

- [ ] **Step 2: 카운트 쿼리 추가**

다른 `useQuery` 선언들 근처(예: `postsQuery` 위/아래, `ProfilePage.tsx:120` 영역)에 추가:
```tsx
  const followCountsQuery = useQuery({
    queryKey: ['follow-counts'],
    queryFn: fetchFollowCounts,
    staleTime: 30_000,
  });
  const followCounts = followCountsQuery.data;
```

- [ ] **Step 3: 하드코딩 카운트 블록 교체**

`ProfilePage.tsx:255-265`의 아래 블록을 찾는다:
```tsx
            {/* 팔로워/팔로잉 — 백엔드 대기, 0 표시 */}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>
                팔로워 <span className="font-medium text-gray-900">0</span>
              </span>
              <span>
                팔로잉 <span className="font-medium text-gray-900">0</span>
              </span>
            </div>
```
다음으로 교체:
```tsx
            {/* 팔로워/팔로잉 — /me/follow-counts, 클릭 시 목록 페이지 진입 */}
            <div className="flex gap-4 text-sm text-gray-500">
              <button
                onClick={() => navigate('/follow?tab=followers')}
                className="hover:text-gray-900 transition-colors"
              >
                팔로워{' '}
                <span className="font-medium text-gray-900">
                  {followCounts?.followerCount ?? 0}
                </span>
              </button>
              <button
                onClick={() => navigate('/follow?tab=followings')}
                className="hover:text-gray-900 transition-colors"
              >
                팔로잉{' '}
                <span className="font-medium text-gray-900">
                  {followCounts?.followingCount ?? 0}
                </span>
              </button>
            </div>
```

- [ ] **Step 4: 타입체크**

Run: `cd frontend && npx tsc -b`
Expected: 통과.

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/pages/profile/ProfilePage.tsx
git commit -m "feat(follow): ProfilePage 헤더 팔로우 카운트 실데이터+목록 진입"
```

---

## Task 6: 브라우저 수동 검증 (2계정 + 시드)

**Files:** 없음(수동 검증)

이 프로젝트는 단위 테스트가 없으므로 실제 화면으로 검증한다. 백엔드는 staging을 쓴다(`api-staging.melonnetherapists.com`).

- [ ] **Step 1: 시드 — 계정 B가 계정 A를 팔로우**

방법: 계정 B로 로그인한 상태의 토큰으로 Swagger UI(`https://api-staging.melonnetherapists.com/swagger-ui/index.html`) 또는 curl로 `POST /api/v1/users/{A의 userId}/follow` 호출. (A를 팔로우하는 사람을 1명 만들고, A가 누군가를 팔로우한 상태도 1건 만들면 양 탭 모두 데이터가 보인다.)

- [ ] **Step 2: dev 서버 기동**

Run: `cd frontend && npm run dev`
Expected: Vite dev 서버 기동, 브라우저로 접속.

- [ ] **Step 3: 검증 체크리스트 (계정 A로 로그인)**

- [ ] `/profile` 헤더에 "팔로워 N · 팔로잉 N"이 0이 아닌 실제 수로 표시
- [ ] "팔로워" 숫자 클릭 → `/follow?tab=followers` 진입, 나를 팔로우한 사람 명단(사진+닉네임+역할), **버튼 없음**
- [ ] "팔로잉" 숫자 클릭 → `/follow?tab=followings` 진입, 내가 팔로우한 사람 + 각 행 "팔로잉" 버튼
- [ ] 팔로잉 탭에서 "팔로잉" 클릭 → 즉시 "팔로우"로 flip(낙관적), 잠시 후 유지(서버 성공) → ProfilePage 재진입 시 팔로잉 카운트 1 감소
- [ ] "팔로우"(재팔로우) 클릭 → "팔로잉"으로 복귀
- [ ] 탭 전환 시 URL `?tab=` 변경, 새로고침해도 같은 탭 유지
- [ ] 목록이 PAGE_SIZE(10) 초과면 하단 "더보기" 노출, 클릭 시 다음 페이지 append
- [ ] (실패 경로) 네트워크 끊고 토글 → "팔로잉" 라벨 롤백 + 에러 토스트

- [ ] **Step 4: 최종 타입체크 + 빌드**

Run: `cd frontend && npx tsc -b`
Expected: 통과.

---

## Task 7: PR 생성

- [ ] **Step 1: 푸시 + PR (사용자 승인 후)**

> 외부 push는 사용자 승인 필요(메모리 규칙). 승인되면:
```bash
git push -u origin feat/follow-list
gh pr create --base develop --title "feat(follow): 팔로우 목록 페이지 + 언팔로우 토글" --body "..."
```

---

## 자기 검토 (작성자 체크 완료)

- **스펙 커버리지:** §1 범위(목록 2탭/팔로잉 토글/팔로워 명단/카운트 진입) → Task 4·5. §2 API → Task 2. §4 토글 → Task 3. §5 페이지 → Task 4. §6 캐시 동기화(`invalidate ['follow-counts']`) → Task 3 Step 1. §7 에러처리(토스트/재시도/빈상태) → Task 3·4. §8 검증 → Task 6. 제외 항목(맞팔 버튼/피드 탭/카드 버튼)은 의도적 미포함, backlog F-12 기록 완료.
- **플레이스홀더:** 없음. 모든 코드 블록 완전.
- **타입 일관성:** `FollowUser`/`FollowStatus`/`FollowCount`/`PagedFollowUsers`(Task1) ↔ api(Task2) ↔ hook(Task3, `FollowUser`/`toggle`/`isFollowing`/`pendingId`) ↔ page(Task4) 시그니처 일치. `fetchFollowCounts`(Task2) ↔ ProfilePage(Task5) 일치. queryKey `['follow-counts']`(Task3 invalidate ↔ Task5 useQuery) 일치. `['follow', tab]`(Task4) 단일 사용.
