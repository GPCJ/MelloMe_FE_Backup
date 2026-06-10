# 팔로우 — 수직 슬라이스 1: 팔로우 목록 페이지 + 언팔로우 토글

작성일: 2026-06-08
상태: 설계 확정 (구현 대기)
관련 메모리: `project_follow_feature`, backlog `B-04`
재개 트리거: 「팔로우 이어가자」

---

## 1. 배경 & 범위

백엔드 팔로우 API 7종이 staging Swagger에 등재 완료(2026-06-08 실조회 확인). 이번 작업은 팔로우 기능의 **첫 수직 슬라이스 하나**를 end-to-end로 동작·검증 가능하게 만드는 것이다.

성공기준: 2개 계정 + 시드 1건으로 "팔로우 목록을 보고, 언팔로우가 눌리고 화면·카운트에 즉시 반영되는" 한 흐름이 실제로 동작한다.

### 이번 슬라이스에 들어가는 것
- `/follow` 페이지 — 탭 2개(팔로워 / 팔로잉)
  - **팔로잉 탭**: 내가 팔로우한 유저 세로 나열(사진+닉네임+역할) + 행마다 "언팔로우" 토글 버튼(낙관적 업데이트 + 응답 reconcile + 실패 롤백)
  - **팔로워 탭**: 나를 팔로우한 유저 세로 나열 — 명단 표시만(이번엔 버튼 없음)
  - 두 탭 모두 "더보기" 버튼 방식 페이지네이션(offset)
- 진입점: `ProfilePage` 헤더에 "팔로워 N · 팔로잉 N" 카운트 표시 → 클릭 시 `/follow?tab=...`

### 이번 슬라이스에서 제외 (백로그)
1. **팔로워 탭 맞팔(follow-back) 버튼** — `FollowUserResponse`에 "내가 이 사람을 팔로우 중인가"(`following`) 필드가 없어 행 버튼의 초기 라벨을 정확히 그릴 수 없음. 1차 팔로우 기능 안정화 후 BE에 `FollowUserResponse.following` 필드 추가를 요청하고 정확한 라벨로 붙인다. (쪽지 `F-10`과 동일한 "응답에 필드 1개 추가" 패턴)
2. **홈피드 "팔로우" 탭 배선**(`/posts/feed/following`, 커서) — 별도 슬라이스(접근 B). `useInfiniteFeed`(Hot Path) 일반화 동반이라 분리.
3. **피드 카드 / 타인 프로필에서의 팔로우 버튼** — 피드 아이템(`TherapyPostSummaryResponse`)·`PostSummary`에 `authorId` 없음 + 타인 프로필(B-09 `GET /users/{id}`) 부재로 BE 블로킹.

---

## 2. API 계약 (staging Swagger 실조회, 2026-06-08)

모든 응답은 `ApiResponse` envelope(`{success, data}`). 응답 인터셉터(`api/axiosInstance.ts:35-40`)가 `success===true`면 `data`로 언랩한다. follow API는 방어적으로 `res.data?.data ?? res.data`를 쓴다(최신 형제 모듈 `api/messages.ts` 패턴).

| 엔드포인트 | 메서드 | 파라미터 | 응답(언랩 후) |
|---|---|---|---|
| `/api/v1/me/follow-counts` | GET | — | `FollowCountResponse` |
| `/api/v1/me/followings` | GET | `page`(기본0), `size`(기본10) | `PagedResponseFollowUserResponse` |
| `/api/v1/me/followers` | GET | `page`(기본0), `size`(기본10) | `PagedResponseFollowUserResponse` |
| `/api/v1/users/{userId}/follow` | GET | path `userId` | `FollowStatusResponse` |
| `/api/v1/users/{userId}/follow` | POST | path `userId` | `FollowStatusResponse` |
| `/api/v1/users/{userId}/follow` | DELETE | path `userId` | `FollowStatusResponse` |

스키마 필드:
- `FollowCountResponse` = `{ followerCount: number, followingCount: number }`
- `FollowUserResponse` = `{ userId: number, nickname: string, profileImageUrl: string, role: string }` — **`following` 필드 없음**(§1 제외 1번 근거)
- `FollowStatusResponse` = `{ userId: number, following: boolean }`
- `PagedResponseFollowUserResponse` = `{ items: FollowUserResponse[], page, size, totalElements, totalPages, hasNext }`

> 페이지네이션 형태 주의: 목록 두 종은 **offset**(`page`/`size` + `totalPages`/`hasNext`)이다. 커서가 아니므로 자동 무한스크롤이 아닌 "더보기" 방식을 쓴다. (커서 방식은 홈피드 `/posts/feed/following` 쪽으로, 이번 범위 밖)

---

## 3. 파일 구성

### 신규
- **`src/types/follow.ts`**
  - `FollowUser` = `{ userId, nickname, profileImageUrl?: string | null, role: string }`
  - `FollowStatus` = `{ userId, following: boolean }`
  - `FollowCount` = `{ followerCount, followingCount }`
  - `PagedFollowUsers` = `{ items: FollowUser[], page, size, totalElements, totalPages, hasNext }`
- **`src/api/follow.ts`**
  - `fetchFollowCounts(): Promise<FollowCount>`
  - `fetchFollowings(page?, size?): Promise<PagedFollowUsers>`
  - `fetchFollowers(page?, size?): Promise<PagedFollowUsers>`
  - `getFollowStatus(userId): Promise<FollowStatus>` (이번 슬라이스 미사용이나 토대로 같이 정의 — 백로그 맞팔 버튼에서 사용 예정. **YAGNI 판단: 토글에 직접 필요 없으면 작성 보류 가능, 구현 단계에서 결정**)
  - `followUser(userId): Promise<FollowStatus>` (POST)
  - `unfollowUser(userId): Promise<FollowStatus>` (DELETE)
  - 모두 `res.data?.data ?? res.data` 언랩.
- **`src/hooks/useFollowToggle.ts`** — 행 단위 낙관적 언팔/팔로우 토글. §4 참조.
- **`src/pages/follow/FollowListPage.tsx`** — `/follow` 페이지. §5 참조.

### 변경
- **`src/App.tsx`** — `AuthRoute` + `Layout` 블록 안(`/profile` 라우트 옆)에 `<Route path="/follow" element={<FollowListPage />} />` 추가.
- **`src/pages/profile/ProfilePage.tsx`** — 프로필 정보 블록에 "팔로워 N · 팔로잉 N" 카운트 추가. `useQuery(['follow-counts'], fetchFollowCounts)`로 조회, 각 숫자 클릭 시 `navigate('/follow?tab=followers'|'followings')`.

---

## 4. 토글 훅 — `useFollowToggle`

댓글 리액션 B패턴(`hooks/useCommentReactionToggle.ts`)을 목록 행에 맞게 변형한다.

- 입력: 현재 목록 `users: FollowUser[]` + `setUsers(next)` (페이지 레벨 단일 진실 소스).
- 단일 in-flight 가드: `togglingId` 상태로 한 번에 한 행만 처리.
- 동작(팔로잉 탭의 언팔로우 기준):
  1. 롤백용 원본 보관.
  2. 낙관적 반영 — 해당 유저를 목록에서 제거하지 않고, "언팔로우됨" 상태로 표시(버튼 라벨이 "팔로우"로 flip). 행은 유지(재팔로우 가능, 갑작스런 제거로 인한 점프 방지).
  3. `unfollowUser(userId)` 호출 → 응답 `FollowStatus.following`으로 reconcile.
  4. 실패 시 원본 롤백 + `toast.error(...)`(sonner, 프로젝트 전역 사용 중) + `console.error('[follow]', err)`.
- 행의 팔로우 상태를 어떻게 보관할지: `FollowUser`엔 `following`이 없으므로, 훅 내부에서 행별 토글 상태를 별도 맵(`Record<userId, boolean>`)으로 관리하거나, 표시용 로컬 뷰모델에 `following` 필드를 덧입힌다. 구현 단계에서 둘 중 단순한 쪽 선택.

> 팔로잉 탭은 로드 시점 전원 `following=true`(정의상 내가 팔로우한 사람). 따라서 초기 라벨은 항상 정확. 토글은 true→false(언팔)→true(재팔로우)만 오간다.

---

## 5. 페이지 — `FollowListPage`

- 래퍼: `NarrowPage`(640px) + `PageHeader`(← 뒤로, 제목 "팔로우").
- 탭: URL `?tab=followers|followings`(기본 `followings`). 탭 전환 시 searchParams 갱신(쪽지함 탭 URL 보존 패턴과 동일 결).
- 목록 데이터: 탭별 RQ `useInfiniteQuery`
  - queryKey: `['follow', tab]`
  - pageParam = 페이지 인덱스(0부터), `initialPageParam: 0`
  - `getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined`
  - queryFn: `tab==='followings' ? fetchFollowings(pageParam) : fetchFollowers(pageParam)`
  - 펼친 items = `data.pages.flatMap(p => p.items)`
- "더보기" 버튼: `hasNextPage`일 때 하단 노출, 클릭 시 `fetchNextPage()`. (자동 무한스크롤·IntersectionObserver 미사용)
- 행 렌더: `UserAvatar`(size sm/md) + 닉네임 + 역할 배지(`role`) + (팔로잉 탭만) 우측 토글 버튼.
- 빈 상태:
  - 팔로잉 탭: "아직 팔로우한 치료사가 없어요"
  - 팔로워 탭: "아직 나를 팔로우한 사람이 없어요"
- 로딩: 스켈레톤 행 또는 기존 Skeleton 컴포넌트 재사용.

---

## 6. 데이터 흐름 / 캐시 동기화

- 카운트: `useQuery(['follow-counts'], fetchFollowCounts)` — ProfilePage 헤더.
- 목록: `useInfiniteQuery(['follow', tab])` — FollowListPage.
- 언팔 토글 성공 후: `queryClient.invalidateQueries({ queryKey: ['follow-counts'] })`로 카운트 동기화. 목록은 페이지 레벨 상태가 이미 reconcile됨(행 유지). 필요 시 `['follow','followings']`도 invalidate 고려하나, 행 유지 정책상 즉시 refetch는 불필요(과도한 깜빡임 회피).

---

## 7. 에러 처리 / 엣지

- 토글 실패 → 낙관적 롤백 + `toast.error` + `[follow]` 로깅.
- 목록 fetch 실패 → 에러 문구 + "재시도" 버튼(`refetch`).
- 카운트 fetch 실패 → 헤더 카운트 자리 숨김 또는 "–" 표시(진입은 가능하게 유지).
- 비로그인 접근 → `AuthRoute`가 차단(라우트가 AuthRoute 안).

---

## 8. 검증

- 2계정 + 시드: 계정 B가 계정 A를 팔로우(Swagger POST로 시드).
- A 로그인 → ProfilePage 헤더 "팔로워 1 · 팔로잉 N" 표시 확인.
- 카운트 클릭 → `/follow` 해당 탭 진입.
- 팔로잉 탭: 내가 팔로우한 유저 나열 → "언팔로우" 클릭 → 즉시 라벨 flip(낙관적) → 성공 시 유지, 강제 실패 주입 시 롤백 + 토스트.
- 카운트가 언팔 후 갱신되는지(헤더 재진입 또는 invalidate 반영).
- "더보기" 버튼으로 다음 페이지 append(목록이 size 초과일 때).
- 팔로워 탭: 명단 표시(버튼 없음) 확인.
- 탭 전환 + URL `?tab=` 보존.
- `tsc -b` 통과.

---

## 9. 백로그 반영 항목

- **팔로워 탭 맞팔 버튼 + BE `FollowUserResponse.following` 필드 요청** — 1차 안정화 후. (backlog 신규 항목)
- **홈피드 팔로우 탭 배선(접근 B)** — 기존 backlog `B-04` 후속.
