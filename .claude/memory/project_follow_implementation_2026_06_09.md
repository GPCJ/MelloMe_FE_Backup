---
name: project_follow_implementation_2026_06_09
description: 팔로우 1차 구현 박제 (인지부채 HIGH) — 다음 만지기 전 필독. 메커니즘 8개 + 자기점검 질문 5개
metadata: 
  node_type: memory
  type: project
  originSessionId: 1328806d-2b5a-4004-bd3f-0367923ba9f3
---

# 팔로우 1차 구현 박제 (인지부채 HIGH, 2026-06-09)

**[[project_follow_feature]] 1차(PR #25, develop 머지 `2cdd6d2`)를 다음에 만지기 전 필독.** 대부분 이전 세션에 구현됐고 토글/캐시/SSE가 얽혀 있어, 코드 읽기 전 이 박제로 의도를 먼저 복원할 것. [[feedback_ai_written_code_cognitive_debt]] 규칙에 따른 플래그.

## 메커니즘 8개

1. **이중 토글 경로 (의도적 분리)** — 목록=`useFollowToggle`(로컬 `Set<number>` `unfollowed`), 드롭다운=`useFollowUser`(RQ `['follow-status', id]` 캐시). 두 경로는 **서로의 상태를 모른다**. 한쪽에서 토글해도 다른 쪽 화면은 즉시 반영 안 됨(M1 staleness). 정책 A 의도 + 교차 화면 staleness는 별개 사안.
2. **목록이 RQ 캐시 대신 로컬 Set을 쓰는 이유** — 팔로잉 탭은 "이번 세션에 언팔된 id"만 추적하면 정책 A(행 유지·버튼 flip) 충족. 전체 팔로잉 상태를 RQ로 들 필요가 없어 `Set`이 더 가벼움.
3. **정책 A 일관성** — 두 토글 경로 모두 목록(`['follow']`)을 **강제 무효화하지 않음**, `['follow-counts']`만 동기화. 언팔해도 행이 사라지지 않음.
4. **낙관적+reconcile+롤백** (`useFollowToggle`) — `applyUnfollow` 낙관적 반영 → 서버 응답 `following`으로 재확정(`applyUnfollow(id, !fresh.following)`) → 에러 시 반대로 롤백. `pendingId`로 한 번에 한 행만.
5. **`useFollowUser` enabled 게이팅** — 드롭다운 `open`일 때만 GET status(닫혀 있으면 호출 안 함, 댓글 N개여도 연 것만 요청). 토글 후 `setQueryData`로 캐시 직접 갱신 → 재오픈 시 재요청 없이 정확값(staleTime 30s).
6. **`UserActionDropdown` hooks 순서** — `useFollowUser`를 본인 가드(`targetUserId === myId` early return) **위에서 무조건 호출**. early return 아래로 내리면 hooks 순서 규칙 위반.
7. **NEW_FOLLOW SSE → invalidate (낙관적 X)** — 언팔 알림 enum이 없어(`NEW_FOLLOW`만) +1 낙관은 감소를 못 따라가 드리프트 → `['follow-counts']` 무효화로 서버 진실 보정. **남이 나를 언팔하면 내 팔로워 수는 실시간 감소 불가**(BE에 UNFOLLOW 이벤트 없음, 의도된 설계). 재진입/포커스 시 보정.
8. **아바타 404 + 폴백 메커니즘** — BE가 raw S3 키 → `resolveImageUrl`이 api-origin 상대경로로 오해석 → 404 → `UserAvatar` onError가 `failedSrc`에 기록 후 이니셜 폴백. `failedSrc`가 boolean이 아닌 **string**인 이유 = src(유저)가 바뀌면 `resolved !== failedSrc`로 자연히 재시도. onError에 `console.warn('[avatar] …')`로 원인 노출([[feedback_fallback_log_to_avoid_masking]]).

## 자기점검 질문 5개 (코드 만지기 전 답해볼 것)

1. 목록에서 언팔한 것과 드롭다운에서 언팔한 것이 서로 화면 동기화되나? 안 되면 왜 의도적인가?
2. `useFollowToggle`은 왜 RQ 캐시 대신 로컬 `Set<number>`을 쓰나?
3. `UserActionDropdown`에서 `useFollowUser`를 early return **위**에 둔 이유는?
4. 남이 나를 언팔하면 내 팔로워 카운트가 즉시 줄지 않는 이유는?
5. `UserAvatar`의 `failedSrc`는 왜 boolean이 아니라 string인가?

## 페이지네이션 주의
- follow 목록은 **offset**(`useInfiniteQuery`, `getNextPageParam: page+1`, `hasNext`). 홈피드(커서)와 다름 — 다음 작업(팔로우 탭 배선)에서 혼동 주의.
