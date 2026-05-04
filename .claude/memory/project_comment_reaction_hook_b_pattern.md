---
name: 댓글 리액션 hook 설계 — B 패턴 채택 (페이지 레벨 단일 hook)
description: 페이지가 comments 배열을 단일 진실로 들고 hook이 setComments 콜백으로 갱신. 게시글 A 패턴과 갈린 이유 + PUT 응답 reconcile 도입 이유 박제
type: project
originSessionId: f86922ec-3cbf-409c-bd3e-aae3623d1239
---
## 결정

`useCommentReactionToggle(comments, setComments)` — 페이지 레벨 단일 hook. 부모(`PostDetailPage`/`CommentDetailPage`)가 `comments[]` state를 들고, hook은 `togglingId`/`handleToggle(commentId, type)`만 반환. CommentCard는 자체 reaction state 없이 props로 받음.

**Why (게시글 A 패턴과 갈린 이유):**

- 게시글은 1개 → A 패턴(`useReactionToggle(initialReaction)` 카드별 자체 state)으로 충분, 진실 분산 비용 낮음
- 댓글은 N개 → A 패턴이면 진실이 2곳(부모 `comments[]` + 카드별 hook state)으로 갈려, `fetchComments` 재호출 시 stale sync 위해 `useEffect` 도입 필요 → 버그 자석(infinite loop, 토글 직후 fetch가 사용자 토글 덮음 등)
- B 패턴은 진실 단일(부모 `comments[]`만 갱신) → stale sync 불필요

비유: A = "학생 30명 각자 가계부 + 선생님도 가계부 따로" / B = "선생님만 가계부, 학생은 신호만 위로". 진실 1곳 vs 2곳.

성능: B는 부모 리렌더 → 자식 리렌더 유발하지만 `React.memo` + immutable update(`comments.map(c => c.id === target ? {...c, 변경} : c)`)로 변경된 카드만 실제 작업. memo 추가는 backlog R-09.

## PUT 응답 reconcile 채택 (게시글의 응답 무시 패턴과 비대칭)

`toggleCommentReaction`은 `Promise<CommentReaction>` 반환 — hook이 응답 본문(`fresh`)으로 댓글 4필드를 다시 한 번 덮어 서버 진실에 reconcile.

**Why:**

- 게시글 hook은 `Promise<void>` + 클라가 카운트 흉내내는 낙관 업데이트만 사용 → 동시성 충돌(다른 디바이스/탭) 시 카운트 어긋남
- 댓글은 한 화면 N개 + 동시 클릭 가능성 ↑ → 응답으로 정확한 카운트 확정
- 백엔드 도메인 규칙 변경(예: 1일 1회 제한) 추가돼도 클라 코드는 응답만 따라가면 됨, `getCountKey`로 일일이 흉내낼 부담 없음

게시글도 같은 방식으로 통일 예정 → backlog R-08.

## 흐름 5단계 (handleToggle 안)

1. 가드: `togglingId !== null` 이면 return (중복 클릭 방지, 진행 중인 카드 disabled UX)
2. 대상 찾기: `comments.find(c => c.id === commentId)` + early return
3. 낙관 업데이트: `target` 기준 `updated` 만들고 `setComments(comments.map(c => c.id === commentId ? updated : c))`. 옵셔널 카운트 필드는 `?? 0` fallback 필수
4. PUT + reconcile: `const fresh = await toggleCommentReaction(commentId, type)` → `setComments(comments.map(c => c.id === commentId ? {...c, 4필드}: c))`로 응답 4필드만 덮음(content/author 보존)
5. 실패 시 롤백: `setComments(prevComments)` (1단계 진입 직전 저장한 원본 통째로)

## togglingId 설계 — boolean 아닌 number | null

게시글 hook은 `toggling: boolean`(1개라 충분)이지만 댓글은 N개라 "어느 카드가 진행 중"인지 추적 필요. `togglingId === comment.id`로 카드별 disabled 처리 가능 + 한 카드 빠른 중복 클릭 방지.

## 후속 (backlog)

- R-08: `togglePostReaction` 응답 reconcile 통일
- R-09: `CommentCard` `React.memo` 적용 (`ReactionBar` `counts` 객체 리터럴 함정 — `useMemo` 또는 어댑터 헬퍼 필요)
- R-10: 본 작업 진행 항목 (PostDetailPage/CommentDetailPage 통합, MSW, 동작 확인)

## 진행 상황

backlog R-10 참조. 메모리는 결정/Why만 (시간 불변).
