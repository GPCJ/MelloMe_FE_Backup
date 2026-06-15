---
name: project_follow_feature
description: "팔로우 기능 — 1차(목록+토글+카운트+드롭다운) PR #25 develop 머지 완료(2cdd6d2). 결정/계약/미해결 박제. 다음=홈피드 팔로우 탭(접근 B)"
metadata:
  node_type: memory
  type: project
  originSessionId: f174ac10-9b4c-4579-97e4-639dc59d7a54
---

# 팔로우 기능 — 1차 완료 (PR #25 develop 머지)

**재개 트리거: 「팔로우 이어가자」(1차 후속) / 「팔로우 탭 이어가자」(홈피드 탭=접근 B)**

> ⚠️ **인지부채 HIGH — 다음 만지기 전 [[project_follow_implementation_2026_06_09]] 필독** (메커니즘 8개 + 자기점검 질문 5개)

BE 7종 엔드포인트 2026-06-08 staging Swagger 확인. FE 1차 슬라이스 구현 완료 → **PR #25 (`feat/follow` → develop) 2026-06-09 머지(merge 커밋 `2cdd6d2`)**. 머지 전 dev 서버(staging API) 2계정 QA로 카운트/토글/드롭다운/탭 모두 정상 확인(더보기만 시드 부족으로 미검증, offset 로직 저위험).

**✅ prod 배포 완료 (2026-06-10, develop→main merge `5654a96`).** 팀 QA가 여력 부족으로 안 들어와 **셀프 QA로 올림**: Playwright 5/5(staging) — 홈피드 렌더/팔로우 탭/뒤로가기 스크롤 복원(Hot Path 회귀 무탈)/F-14 아바타 경고0+작성자 드롭다운/언팔 정책A+재팔로우 복원. 사전에 인지부채 자기점검 4개(이중 토글 분리·hooks 순서·캐시 부분매칭·스크롤 store) 통과. 머지 충돌 없음(cherry-pick dupes 자동 처리), tsc OK. Playwright는 throwaway로 restore([[project_playwright_e2e_setup_2026_06_10]]). 미자동화=#3필터/#4fallback/#5리액션캐시(저위험·기리뷰)·#10실시간(2계정 수동).
설계/계획 문서: `docs/superpowers/specs/2026-06-08-follow-list-toggle-design.md`, `docs/superpowers/plans/2026-06-08-follow-list-toggle.md`.

## API 계약 (ApiResponse envelope → `res.data?.data ?? res.data` 언랩)

| 엔드포인트 | 메서드 | 파라미터 | 응답 |
|---|---|---|---|
| `/me/follow-counts` | GET | — | `FollowCount {followerCount, followingCount}` |
| `/me/followings`·`/me/followers` | GET | `page`(0), `size`(10) | `PagedFollowUsers` (offset, totalPages/hasNext) |
| `/users/{userId}/follow` | GET/POST/DELETE | path userId | `FollowStatus {userId, following}` |
| `/posts/feed/following` | GET | `size/cursor/postType` (sort 없음) | `CursorPaged<TherapyPostSummaryResponse>` (접근 B용, 미사용) |

`FollowUser = {userId, nickname, profileImageUrl, role}` — ⚠️ **`following` 필드 없음** (F-12 근거).

## 1차 구현 완료 (PR #25)
- **`/follow` 페이지** — 팔로잉/팔로워 2탭, "더보기"(offset). `types/follow.ts`·`api/follow.ts`·`hooks/useFollowToggle.ts`·`pages/follow/FollowListPage.tsx` 신규.
- **팔로잉 탭 언팔 토글** — 낙관적+reconcile+롤백. **정책 A(언팔해도 행 유지, 버튼 flip)**. 버튼 라벨=**클릭 시 동작을 직접 표시**(`f53fccc`): 팔로우 중=아웃라인 "언팔로우"(보호 없이 바로 언팔) / 언팔한 행=검정 채움 "팔로우". 직전 호버 스왑(팔로잉↔언팔로우, `203f79e`) 폐기 — 사용자가 "버튼이 항상 일어날 일을 표시" 선호로 뒤집음.
- **팔로워 탭** — 명단만(맞팔 버튼은 F-12 보류).
- **ProfilePage 헤더 카운트** — `/me/follow-counts` 실데이터+클릭 진입(하드코딩 0 교체).
- **작성자 드롭다운 팔로우** — `UserActionDropdown`(게시글 상세+댓글 작성자) "팔로우"/"팔로잉" 토글, 열릴 때만 GET status, 본인 가드 기존. `hooks/useFollowUser.ts` 신규. 3항목(프로필/팔로우/쪽지) 아이콘 통일(User/UserPlus·UserCheck/Mail).
- **NEW_FOLLOW 카운트 동기화** — FE `NotificationType` enum에 `NEW_FOLLOW` 누락 보강 + `useNotificationSSE`가 수신 시 `['follow-counts']` 무효화. (언팔 알림은 enum에 없어 낙관적 +1 불가 → 무효화로 서버 진실 보정)

## 결정 박제
- **정책 A(언팔=행 유지)** — 되돌리기 친화 + 모바일에서도 재팔로우로 복구(Tailwind v4 hover 게이팅으로 sticky 글리치 없음). 두 토글 경로(useFollowToggle·useFollowUser) 모두 `['follow']` 강제 무효화 안 함, 카운트만 동기화.
- 누가 나를 언팔 → 내 팔로워 수 실시간 감소 **불가**(BE에 UNFOLLOW 이벤트 없음, 의도된 설계). ProfilePage 재진입/포커스 시 보정.

## 해소
- **✅ 팔로우 아바타 이미지 깨짐 (F-14) — BE 해결 (2026-06-10)**: BE가 `FollowUserResponse.profileImageUrl`을 raw S3 키 대신 **풀 URL**로 응답하도록 조치 → 작성자 이미지(`TherapyPostSummaryResponse.authorProfileImageUrl`)와 동일 패턴. 팔로잉/팔로워 탭 아바타 정상 표시. FE 변경 불필요(요청대로 우회 안 함). FE의 `UserAvatar` onError 이니셜 폴백(`cd556ac`)+`console.warn('[avatar] …')` 원인 노출(`eb8f469`)은 graceful degradation으로 잔존(향후 다른 깨짐 대비, 무해).

## 미해결 (BE 의존, passive)
- **F-12 맞팔 버튼** — `FollowUserResponse.following` 필드 추가 요청(1차 안정화 후). backlog F-12.

## 다음 (FE 단독 가능)
- ~~홈피드 "팔로우" 탭 배선 (접근 B)~~ — **✅ 완료 (2026-06-09, PR #26 머지 `41484c9`)**. `useInfiniteFeed` 일반화(queryKey+fetchPage 주입형) 채택, 전체 Hot Path 회귀 무탈. 구현/취약점 박제 [[project_follow_feed_tab_implementation_2026_06_09]], backlog F-15. 남은 후속=스크롤 복원·정렬/필터(BE)·backTo 파생화.
