---
name: 댓글 리액션 3종 통일 확정 (2026-05-03 백엔드 반영 확인)
description: 백엔드 댓글 리액션이 LIKE/CURIOUS/USEFUL 3종으로 변경 완료됨 — 게시글과 동일 스펙, 프론트 API 연동 즉시 가능
type: project
originSessionId: e07eb9e6-05bf-4a5d-8f2b-439b1deb33fe
---
## 현재 확정 스펙 (2026-05-03 Swagger `/v3/api-docs` 재확인)

**GET /api/v1/comments/{commentId}/reaction**
```json
{
  "success": boolean,
  "data": {
    "commentId": int64,
    "likeCount": int64,
    "curiousCount": int64,
    "usefulCount": int64,
    "myReactionType": "LIKE | CURIOUS | USEFUL"  // null 가능
  }
}
```

**PUT /api/v1/comments/{commentId}/reaction**
```json
// Request body
{ "reactionType": "LIKE | CURIOUS | USEFUL" }
// Response: GET과 동일 구조
// 같은 타입 재요청 시 취소, 다른 타입이면 전환
```

## 히스토리

- 2026-05-01: 백엔드 `LIKE/DISLIKE` 2종 vs 프론트 UI 3종 placeholder 불일치 발견 → 3종 통일 요청 방향 결정
- 2026-05-03: 백엔드 반영 완료 확인. `dislikeCount` → `curiousCount`+`usefulCount` 교체, enum 3종으로 변경

## 프론트 현 상태 (2026-05-01 기준, 아직 미연동)

- `frontend/src/components/post/CommentCard.tsx` — Heart/Star/Lightbulb 3개 아이콘 UI만 존재, `onClick` stopPropagation만 호출
- `api/posts.ts`에 댓글 리액션 함수 부재
- `mocks/handlers/comments.handlers.ts`에 reaction 핸들러 부재

## 응답 필드 비교

| 필드 | 게시글 (`PostReactionStatusResponse`) | 댓글 (`CommentReactionStatusResponse`) |
|------|------|------|
| 카운트 | `likeCount`/`curiousCount`/`usefulCount` | `likeCount`/`curiousCount`/`usefulCount` ✅ |
| 본인 리액션 | `myReactionType: [LIKE,CURIOUS,USEFUL]` | `myReactionType: [LIKE,CURIOUS,USEFUL]` ✅ |
| 부가 | `reactionCounts` Map / `topReactionType` 등 | (없음) — 댓글은 부가 필드 미포함 |

→ 타입/API 함수/MSW 핸들러 작성 후 `CommentCard`에서 `ReactionBar` 재사용 가능 (size prop만 분기)

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

## 2026-05-04 갱신 — 응답 4필드 동봉 확인 + 프론트 hook B 패턴 작업 진행 중

Swagger `/v3/api-docs` 재확인 결과, `CommentResponse`/`ReplyCommentResponse` 본 스키마에 `likeCount`/`curiousCount`/`usefulCount`/`myReactionType` 4필드가 동봉되어 내려옴. 별도 `GET /reaction` 호출 불필요(N+1 회피) — 게시글 `PostDetail`에 reaction 필드 동봉되는 패턴과 동일.

`fetchComments` 응답에서 바로 reaction 필드 추출 → hook 단계에서 `comments[]` 단일 진실로 다룸.

ReactionBar는 `counts/myReactionType/size` props로 일반화(정규화) — `PostReaction` 의존 제거, 게시글/댓글 호출부 모두 어댑터 객체로 넘김.

프론트 hook 설계: B 패턴 채택(페이지 레벨 단일 hook + `comments[]` 단일 진실) + PUT 응답 reconcile. 결정/Why → `project_comment_reaction_hook_b_pattern.md`.

기존 "프론트 현 상태 (2026-05-01 기준)" 섹션은 stale (이번 작업으로 거의 해소). 잔여 작업(PostDetailPage/CommentDetailPage 통합, MSW, 동작 확인)은 backlog R-10 참조.
