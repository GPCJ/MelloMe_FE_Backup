---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /report-notion으로 업로드 가능.
type: draft
updated: 2026-05-05
originSessionId: 40bae66f-eb40-464f-9ef2-fc78c83fb4ff
---

# 1) 📈 프로젝트 성과 & 지표 — `05-04 — R-10 댓글 리액션 API 연동 성과`

게시글과 동일한 3종(LIKE/CURIOUS/USEFUL) 토글을 댓글에도 도입하여, 게시글/댓글 양쪽에서 같은 리액션 UX를 제공할 수 있게 되었습니다.

## 적용 범위

- **타입 (`types/post.ts`)**: `CommentResponse`에 `likeCount` / `curiousCount` / `usefulCount` / `myReactionType` 4필드 옵셔널 추가, `CommentReaction` 인터페이스 신설
- **API (`api/posts.ts`)**: `getCommentReaction` / `toggleCommentReaction` 추가(unwrap 패턴). 게시글 쪽 `getReaction` → `getPostReaction` 리네임 + unwrap 적용. 호출부 0건 dead code 정리
- **ReactionBar (`components/post/ReactionBar.tsx`)**: `PostReaction` 의존을 제거하고 `counts` / `myReactionType` / `size` 형태의 일반화된 props로 전환. 게시글/댓글 양쪽에서 재사용 가능
- **useCommentReactionToggle (`hooks/useCommentReactionToggle.ts`)** 신설: 페이지 레벨 단일 hook이 `comments` 배열과 `setComments`를 받아 진실을 단일화. 낙관 업데이트 → PUT → 응답으로 reconcile → 실패 시 롤백
- **CommentCard / PostDetailPage / CommentDetailPage**: 임시 placeholder 제거 후 `ReactionBar` 연동, hook 호출 + props 전달. `CommentDetailPage`는 parent + replies가 별도 state라 가상 배열과 분배 setter 어댑터로 hook과 연결

## 검증

- `npx tsc -b` 통과(EXIT 0). R-07 후속 작업과 베이스 mismatch 9건은 `CommentInput.onSubmit` 호출부 3곳을 함께 정리하여 해소(`(e) => handleSubmitComment(e, content)` → `() => handleSubmitComment(content)`)
- MSW 핸들러는 의도적으로 스킵. 백엔드가 dev/staging에 이미 배포되어 있어 `comments.handlers.ts`에 가짜 토글 로직을 만드는 대신 staging 직접 테스트로 검증

## 한계점 (박제)

- 댓글 리액션 사용 데이터는 현재 수집되지 않습니다. GA4 이벤트 스펙에 댓글 리액션 토글 항목이 없어, 기능 동작은 확인되어도 도메인 효용(어떤 리액션이 댓글에서 더 쓰이는지)은 측정 불가
- `PostSummary`에는 여전히 `myReactionType`이 포함되지 않습니다. 게시글 카드 리스트 단계에서는 별도 GET 호출이 필요한 구조 유지

## 이력서 bullet 예시

- 게시글 리액션 시스템을 댓글에도 확장하면서 `ReactionBar` 컴포넌트의 props를 도메인 비종속(`counts`/`myReactionType`)으로 일반화하여, 향후 다른 도메인(첨부파일/공지 등)에 동일 컴포넌트를 재사용할 수 있도록 설계했습니다.
- 백엔드와 협의해 댓글 응답에 리액션 4필드를 직접 동봉하도록 하여 댓글 N개당 리액션 GET을 별도로 호출하던 N+1 패턴을 회피했습니다.

---

# 2) 🏗 설계 결정 & 아키텍처 — `05-04 — 댓글 리액션 hook 설계 (B 패턴 + PUT reconcile)`

## 1. 댓글 리액션 hook은 페이지 레벨 단일 hook(B 패턴)으로 둔다

**문제:**
게시글 리액션은 `PostCard` 또는 `PostDetailPage`에서 카드별로 hook을 호출하는 A 패턴을 씁니다. 댓글 리액션도 동일한 A 패턴(`CommentCard`마다 hook 호출)으로 갈지, 페이지 레벨에서 단일 hook이 `comments` 배열 전체를 관리하는 B 패턴으로 갈지 결정이 필요했습니다.

**검토한 선택지:**
- **A 패턴 (카드별 hook)**: 게시글과 일관성. 단, `CommentCard`마다 hook 호출이 일어나 동일 댓글 리스트의 진실이 카드별로 분산됨
- **B 패턴 (페이지 단일 hook)**: 부모 페이지가 이미 `comments` 배열을 들고 있고(`useComments`로 작성/삭제/편집도 같은 배열에서 닫혀 있음), 진실의 단일화 지점이 부모임

**결정:** B 패턴 채택.

근거:
- 게시글은 부모(목록 페이지)가 들고 있는 진실이 "여러 게시글"이지만 각 게시글의 리액션 상세는 카드 내부에 들어가는 게 자연스럽습니다(목록은 요약만 표시).
- 댓글은 부모(상세 페이지)가 이미 `comments` 배열 전체와 그 mutation 책임을 갖고 있어서, 리액션만 카드로 빼면 진실이 두 곳으로 갈라집니다.
- A vs B는 "컴포넌트 구조 차이"가 아니라 **부모가 이미 들고 있는 진실의 형태 차이**에서 갈렸습니다.

게시글까지 B로 통일하는 작업은 R-08(별도 작업)로 분리합니다.

---

## 2. 토글은 낙관 업데이트 + PUT 응답 reconcile로 보강한다

**문제:**
리액션 토글 UX는 즉시 반영이 필요하므로 낙관 업데이트가 기본입니다. 그러나 낙관 업데이트만 쓰면 동시성 충돌, 백엔드 카운트 계산 규칙 변경, 권한 차단 등에서 클라이언트 추측값과 서버 실제값이 어긋날 위험이 있습니다.

**검토한 선택지:**
- **낙관 업데이트만**: 단순하지만 서버 truth와의 어긋남 가능성
- **PUT 후 GET refetch**: 안전하지만 라운드트립 1회 추가
- **PUT 응답 본문에 서버 truth 동봉 → reconcile**: 한 번의 네트워크 호출로 서버 상태 반영 가능

**결정:** 낙관 업데이트 → PUT → 응답으로 reconcile → 실패 시 롤백 패턴 채택.

근거:
- 백엔드가 PUT 응답에 갱신된 카운트와 `myReactionType`을 함께 내려주므로, 별도 GET 없이도 서버 truth로 클라이언트 흉내값을 덮어쓸 수 있습니다.
- 게시글 쪽 R-08도 같은 방향으로 통일 예정입니다.

---

## 3. CommentResponse에 reaction 4필드를 동봉한다 (백엔드 합의)

**문제:**
댓글마다 `GET /comments/{id}/reaction`을 별도 호출하면 댓글 N개에 대해 N+1 GET이 발생합니다.

**검토한 선택지:**
- 댓글 응답과 리액션 응답을 분리(REST 정합성↑, 호출 N+1)
- 댓글 응답에 리액션 4필드 동봉(REST 정합성↓, 호출 1회)

**결정:** 댓글 응답에 `likeCount` / `curiousCount` / `usefulCount` / `myReactionType` 4필드 동봉.

근거:
- 댓글 리스트 진입 시 모든 댓글의 리액션 상태가 항상 함께 필요하므로, 분리해도 호출이 항상 짝지어 발생합니다. 페이로드를 한 번에 받는 게 일관됩니다.
- 2026-05-04 Swagger 재확인으로 4필드 응답 동봉 확정.

---
