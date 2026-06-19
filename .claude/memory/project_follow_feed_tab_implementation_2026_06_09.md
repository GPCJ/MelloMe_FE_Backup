---
name: project_follow_feed_tab_implementation_2026_06_09
description: 팔로우 탭(홈피드 접근 B) 구현 박제 (인지부채 HIGH) — 다음 만지기 전 필독. 메커니즘 7개 + 자기점검 5개
metadata:
  node_type: memory
  type: project
  originSessionId: 1328806d-2b5a-4004-bd3f-0367923ba9f3
---

# 팔로우 탭(홈피드 접근 B) 구현 박제 (인지부채 HIGH, 2026-06-09)

**[[project_follow_feature]]의 "다음 작업"(홈피드 팔로우 탭, F-15)을 AI 작성으로 완결한 결과물.** 브랜치 `feat/follow-feed-tab`, 커밋 2개(`0d89472` backTo / `3baa1c9` 피드 탭). 다음에 피드/상세 뒤로가기/무한스크롤을 만지기 전 이 박제로 의도를 먼저 복원할 것. [[feedback_ai_written_code_cognitive_debt]] 규칙.

## 메커니즘 7개

1. **useInfiniteFeed 일반화 (queryKey+fetchPage 주입형)** — 기존 `size/sort` 옵션을 **제거**하고 `queryKey: QueryKey`와 `fetchPage({pageParam,signal})→Promise<CursorPagedPosts>`를 받는다. 이제 size/sort/postType는 **호출부가 클로저로 닫아** 넘긴다. 전체 피드/팔로우 피드가 같은 무한스크롤 코어(getNextPageParam·loadMore 가드·retry:false·staleTime:Infinity·onError·flatMap)를 공유. `useInfiniteFeed.ts`.
2. **캐시 슬롯 분리** — 전체 `['feed',{size,sort}]` / 팔로우 `['feed-following',{size}]`. 같은 훅이지만 queryKey가 달라 RQ 캐시가 안 섞인다. 한 탭의 페치/스크롤이 다른 탭 캐시를 안 건드림.
3. **이중 sentinel observer** — 전체 피드 옵저버(`isInfiniteMode` 게이팅)와 팔로우 옵저버(`activeTab==='following'` 게이팅)가 **독립 effect+독립 ref**(`sentinelRef`/`followingSentinelRef`). 두 탭이 상호배타 렌더라 한 번에 하나만 마운트. 전체 피드 Hot Path 옵저버를 한 줄도 안 건드리려고 일부러 분리.
4. **탭 URL 보존 (state→searchParams 파생)** — `activeTab`이 `useState('all')`→`searchParams.get('tab')` 파생으로 바뀜. `handleTabChange`가 URL만 갱신(다른 param 보존). 뒤로가기 시 URL이 탭을 복원.
5. **backTo Link state — 진짜 원인은 탭 state가 아니었다** — 뒤로가기 시 탭이 풀린 진짜 원인은 `PostDetailPage`의 헤더 `backTo='/posts'` **하드코딩**이었다(브라우저 back은 쿼리 보존, 인앱 헤더 ← 버튼은 `/posts`로 보냄). 해결: 팔로우 탭 PostCard가 `backTo="/posts?tab=following"`를 **Link state(from)**로 싣고 → PostDetailPage가 `useLocation().state.from`을 읽어 헤더 backTo로 사용(없으면 `/posts` 폴백). **탭 URL 보존(M4)과 backTo(M5)가 둘 다 있어야** 뒤로가기 탭 유지가 성립.
6. **cross-cache 리액션 패치** — `handleReactionUpdated`가 `setQueriesData`를 `['feed']`와 `['feed-following']` **둘 다** 호출. RQ 부분매칭은 첫 요소 동등비교라 `'feed' !== 'feed-following'` → 한 번으로 두 캐시 못 잡음. patch 함수는 한 번 정의해 양쪽에 재사용.
7. **팔로우 피드 = 커서 페이지네이션** (전체 피드와 동일), 단 sort/snapshot 없음. ⚠️ follow **목록**(`/me/followings`, [[project_follow_implementation_2026_06_09]])은 **offset**임 — 같은 "팔로우" 도메인인데 피드=커서/목록=offset 혼동 주의.

## 의도된 한계 (박제)
- **팔로우 탭 스크롤 위치 미복원** — 뒤로가기 시 목록 **내용**은 RQ 캐시(`staleTime:Infinity`)로 복원되지만 **스크롤 위치는 top**. 전체 피드만 단일 슬롯 `feedScrollStore` snapshot으로 스크롤 복원. 팔로우까지 맞추려면 store 일반화 필요 → Hot Path 보호 위해 **이번 범위 제외**, backlog 후속.
- **정렬(인기/최신) 없음** — BE `/posts/feed/following`이 sort 미지원(2026-06-08 staging Swagger). 서버 기본 정렬(최신)만. sort 원하면 BE 추가 선결.
- **therapyArea 필터 없음** — following 엔드포인트가 therapyArea 미수신 → 팔로우 탭에서 필터칩 숨김.

## 알려진 취약점 (code-review high에서 발견, 미수정 박제)
- **backTo 하드코딩 잠재 취약 (`PostListPage.tsx` 팔로우 카드 `backTo="/posts?tab=following"`)** — 현재 팔로우 탭 URL과 정확히 일치해 무해하지만, 팔로우 탭이 **향후 자체 쿼리 파라미터를 갖게 되면** backTo가 그걸 떨군다(뒤로가기 시 그 param 손실). 근본 해법은 하드코딩 대신 진입 시점의 `location.pathname+search`를 backTo로 싣는 것. 관측 가능한 버그는 아니라 이번엔 미수정 — 팔로우 탭에 필터/정렬 등 URL param 추가 시 같이 손볼 것.
- (참고) 삭제 시 `['feed-following']` 미무효화 갭은 `d4d8303`에서 **수정 완료**(리액션 패턴과 정합).

## 자기점검 질문 5개 (코드 만지기 전 답해볼 것)
1. useInfiniteFeed는 이제 size/sort를 왜 옵션으로 안 받나? 그 값들은 지금 누가 책임지나?
2. 전체 피드와 팔로우 피드가 **같은 훅 인스턴스 종류**인데 캐시가 안 섞이는 이유는?
3. 리액션 토글 시 `setQueriesData`를 왜 두 번 호출하나? `['feed']` 한 번으로 안 되는 이유는?
4. 뒤로가기 시 팔로우 탭이 유지되는 메커니즘 2개(탭 URL 보존 / backTo Link state) 중 하나만 빠지면 각각 무엇이 깨지나?
5. 팔로우 탭 스크롤이 top으로 가는데 목록 내용은 남아있는 이유는?
