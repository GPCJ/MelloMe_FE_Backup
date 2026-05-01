---
name: 댓글 리액션 3종 통일 방향 결정 (2026-05-01)
description: 백엔드 LIKE/DISLIKE 2종 vs 프론트 UI 3종 placeholder 불일치 발견, 게시글 동일 3종으로 통일 요청 방향 결정
type: project
originSessionId: e07eb9e6-05bf-4a5d-8f2b-439b1deb33fe
---
## 발견된 사실 (2026-05-01)

**백엔드 현 스펙** (Swagger `/v3/api-docs` 확인):
- `GET /api/v1/comments/{commentId}/reaction` → `CommentReactionStatusResponse`
  - `commentId`, `likeCount`, `dislikeCount`, `myReactionType: enum[LIKE, DISLIKE]`
- `PUT /api/v1/comments/{commentId}/reaction` → `ToggleCommentReactionRequest`
  - `reactionType: enum[LIKE, DISLIKE]` (required)

**프론트 현 상태**:
- `frontend/src/components/post/CommentCard.tsx:172-189` — Heart/Star/Lightbulb 3개 아이콘이 그려지지만 `onClick={(e) => e.stopPropagation()}`만 호출, API/MSW/카운트 표시 모두 없음 (순수 UI placeholder)
- `api/posts.ts`에 댓글 리액션 함수 부재
- `mocks/handlers/comments.handlers.ts`에 reaction 핸들러 부재

**즉, UI는 게시글 리액션 모양(LIKE/CURIOUS/USEFUL 3종)을 시각적으로 베껴놓았는데 백엔드는 LIKE/DISLIKE 2종.**

## 결정 (사용자, 2026-05-01)

게시글과 동일한 3종(`LIKE / CURIOUS / USEFUL`)으로 통일 요청 방향. "거의 기정사실"로 판단 → 프론트 선작업 병렬 진행.

**Why:** 프론트 UI가 이미 3종 가정으로 그려져 있고, 게시글 리액션과의 일관성, `PostReaction` 타입 재사용 가능성이 높음. DISLIKE 도입의 모더레이션 영향(치료사 커뮤니티 심리적 안전)이 확인되지 않은 상태에서 일관성 우선.

**How to apply:**
- PM/디자이너 메시지 먼저: "댓글 리액션은 게시글과 동일하게 LIKE/CURIOUS/USEFUL 3종으로 통일할까요? 현재 백엔드는 LIKE/DISLIKE 2종, 프론트 UI는 3종 placeholder입니다." → 컨펌 받은 뒤 백엔드 요청
- 백엔드 요청 시 변경 범위 명시: 요청 enum / 응답 (`dislikeCount` 제거 → `curiousCount`+`usefulCount` 추가) / DB 마이그레이션(기존 DISLIKE 처리) / `topReactionType`·`reactionCounts` 등 게시글 추가 필드 적용 여부
- 백엔드 freeze 해제됨(2026-05-01) → 요청 즉시 가능

## 응답 필드 비교 (참고용)

| 필드 | 게시글 (`PostReactionStatusResponse`) | 댓글 (`CommentReactionStatusResponse`) |
|------|------|------|
| ID | `postId` | `commentId` |
| 카운트 | `likeCount`/`curiousCount`/`usefulCount` | `likeCount`/`dislikeCount` |
| 본인 리액션 | `myReactionType: [LIKE,CURIOUS,USEFUL]` | `myReactionType: [LIKE,DISLIKE]` |
| 부가 | `reactionCounts` Map / `topReactionType` / `topReactionCount` / `topReactionColorToken` | (없음) |

게시글 응답이 훨씬 풍부 → 댓글에 동일 적용 요청 시 백엔드 작업량 큼. 댓글에 부가 필드 필요 여부도 백엔드 요청 전 결정 필요.

## 프론트 선작업 가능 범위 (백엔드 결정 무관)

**낮은 위험 (어느 결과든 거의 그대로 살아남음)**:
1. `ReactionBar`에 `size?: number` prop 추가 — 댓글용 14px, 게시글용 16px 분기. 백엔드 통합 여부와 무관하게 가치 있음
2. 타입 정의 (`types/`에 `CommentReaction` 골격) — 게시글 `PostReaction` 모방
3. API 함수 골격 (`getCommentReaction(commentId)`, `toggleCommentReaction(commentId, type)`) — endpoint path는 확정이라 응답 모양만 결정 시 갈림

**중간 위험**:
4. `CommentCard`에서 `ReactionBar` 재사용 시도 — 응답 모양에 따라 어댑터 필요할 수 있음

**높은 위험 (PM/디자이너 답에 의존)**:
5. UI 텍스트/아이콘 최종 매핑 — 보류 권장

권장 작업 순서: 1 → 3 → 2 → 4.

## ReactionBar 재사용 평가

기존 `frontend/src/components/post/ReactionBar.tsx`는 `PostReaction | null` 타입을 받음.
- 응답 모양 통일되면 → size prop 추가만으로 재사용 가능 (가장 깔끔)
- 응답 모양 갈리면 → 별도 `CommentReactionBar` 또는 prop을 정규화된 형태로 받게 하고 부모에서 어댑팅
