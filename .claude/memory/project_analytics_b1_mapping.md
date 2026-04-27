---
name: GA4 주요 7개 이벤트 삽입 매핑 표 (B1 결과)
description: 2026-04-27 B1 단계 결과. 주요 7개 삽입 위치/트리거/파라미터 + 기존 4종(cf7750e) 리네임 매트릭스 + B2에서 결정할 의문점. B2(헬퍼 설계)는 이 파일을 입력으로 시작
type: project
updated: 2026-04-27
originSessionId: 171770bc-7818-42fd-9134-3671e398b299
---
# GA4 주요 7개 이벤트 삽입 매핑 표 (B1)

PM 정식 스펙 v1(`./project_analytics_event_spec_pm_v1.md`)을 기반으로, 코드 grep을 통해 주요 7개 이벤트의 실제 삽입 후보 위치를 정리.

**Why:** B2 헬퍼 설계(`reaction` 통합/`useScreenExit` 훅) 시작 전 트리거 위치를 확정해야 헬퍼 인터페이스가 정해짐. B1은 grep + 표로 입력만 모음, 코드 변경 X.

**How to apply:** 다음 세션 B2 진입 시 이 파일로 시작 → 의문점 4개 결정 → 헬퍼 시그니처 초안 → B3에서 실제 코드 작성.

---

## A. 기존 4종(cf7750e) 리네임/유지 매트릭스

| 기존 이벤트 | 위치 | PM 정식 스펙 | 결정 안 | 사유 |
|---|---|---|---|---|
| `signup_completed` | `SignupPage.tsx:51` | `sign_up` ★ | **리네임** → `sign_up` | PM 명명 일치, 1:1 매핑 |
| `login_completed` | `LoginPage.tsx:34` | (없음) | **유지** | 우린 익명이라 `session_start` 자동 이벤트로는 인증 vs 비인증 구분 불가, 로그인 자체 가치 유지 |
| `verification_requested` | `TherapistVerificationPage.tsx:84` | `certification_submitted` (비주요) | **리네임** → `certification_submitted` | 트리거 시점(제출) 일치, PM 명명 통일 |
| `first_post_created` | `PostCreatePage.tsx:88` (`if (wasFirstPost)`) | `post_created` ★ + 별도 first 판별 | **유지 + post_created 추가 발송** | first_post는 1회 전환 지표(가입→첫글), post_created는 매번 활성도 — 의미 다름, 둘 다 가치 |

→ B2에서 사용자 최종 컨펌 필요. PM에 "login_completed 익명 유지 OK?" 1줄 확인 요청 추천.

---

## B. 주요 7개 삽입 위치 매핑 표

| # | 이벤트 | 트리거 위치 | 트리거 시점 | 파라미터 | 신규/리네임 | 의문점 |
|---|---|---|---|---|---|---|
| 1 | `sign_up` ★ | `SignupPage.tsx:51` | 가입 mutation 성공 직후 (`navigate` 전) | — | A에서 리네임 | — |
| 2 | `profile_edited` ★ | `ProfilePage.tsx` (`updateMyProfile`/`uploadProfileImage` 성공 후) | 닉네임/프사 수정 성공 시 | — | 신규 | **자기소개 PATCH API 존재 여부 확인 필요**. 현재 PATCH `/me`는 `{ nickname }`만 (auth.ts:50) |
| 3 | `certification_started` ★ | `TherapistVerificationPage.tsx` (mount `useEffect`) | 페이지 진입 시 1회 | — | 신규 | AuthRoute 통과 후만 발송. 이미 APPROVED 유저(line 73)는 발송 제외할지? |
| 4 | `certification_completed` ★ | `VerificationCompletePage.tsx:35` (`verStatus === 'APPROVED'` 분기 effect) | APPROVED 화면 표시 시 1회 | — | 신규 | MVP 정책상 즉시 승인이라 사실상 모든 인증 신청자가 도달. PENDING/REJECTED는 발송 제외 |
| 5 | `post_created` ★ | `PostCreatePage.tsx` (PostCreate mutation 성공 후) | 매 게시글 등록 | — | 신규 (first_post_created와 병행) | 첨부 여부/visibility 등 파라미터 추가 PM 합의? PM CSV엔 무파라미터 |
| 6 | `reaction` ★ | 다수: `useReactionToggle.ts:49` + `PostCard.tsx:29-31`(스크랩) + `PostDetailPage.tsx:136-138`(스크랩) + `useCommentSubmit.ts:25` / `CommentWritePage.tsx:60`(댓글) + 첨부 다운로드 클릭 | 6분기 통합 | `type` ∈ {comment, react_like, react_useful, react_curious, scrap, download} | 신규 | 댓글 트리거 단일화 필요(useCommentSubmit만? CommentWritePage도?). 첨부 다운로드 핸들러 위치 미파악 |
| 7 | `screen_exit` ★ | `PostListPage`/`PostCreatePage`/`ProfilePage` 각 mount + visibility/route 변경 hook | 페이지 이탈 시 1회 (duration 계산 후) | `screen_name` ∈ {feed, post_write, my_page}, `duration` (ms) | 신규 | duration 측정 패턴(visibilitychange + 라우트 변경 + beforeunload) 통합 — 헬퍼 훅 필요 |

---

## C. 라우트 ↔ screen_name 매핑 (App.tsx 기준)

| screen_name | 라우트 | 페이지 컴포넌트 |
|---|---|---|
| `feed` | `/posts` | `PostListPage` |
| `post_write` | `/posts/new` | `PostCreatePage` |
| `my_page` | `/profile` | `ProfilePage` |

`/posts/:postId/edit`(PostEditPage)는 PM 스펙 screen_name 없음 — post_write에 포함할지 별도 처리할지 PM 컨펌 필요.

---

## D. B2에서 결정할 의문점 (4개)

1. **`login_completed` 처리** — 유지 vs 제거 (PM 컨펌 1줄 요청)
2. **`profile_edited` 트리거 범위** — 닉네임/프사만? 자기소개 API 존재 시 포함?
3. **`reaction.comment` 단일화** — `useCommentSubmit.ts`만 발송 vs `CommentWritePage` 단독 페이지에서도 별도 발송
4. **`screen_exit` 측정 패턴** — 단일 훅(`useScreenExit(name)`)으로 visibility + 라우트 + beforeunload 통합 vs 페이지마다 직접 작성

---

## E. B2 헬퍼 설계 진입 시 시그니처 초안 (메모만)

```ts
// 1) trackEvent 래퍼 (window.gtag 옵셔널 가드)
function trackEvent(name: string, params?: Record<string, unknown>): void

// 2) reaction 단일 헬퍼
type ReactionEventType = 'comment' | 'react_like' | 'react_useful' | 'react_curious' | 'scrap' | 'download';
function trackReaction(type: ReactionEventType, extra?: { postId?: number }): void

// 3) screen_exit 훅
function useScreenExit(screenName: 'feed' | 'post_write' | 'my_page'): void
// 내부: 진입 시각 ref + visibilitychange + route 변경 effect cleanup + beforeunload
```

이 시그니처는 B2에서 4개 의문점 해결 후 확정.
