---
title: 멜로미 프론트 의존성 맵
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# 의존성 맵 v1 (2026-05-04)

- 범위: hot path (게시글/댓글 도메인) 중심, 점진 확장
- 입자도: 심볼 단위 (함수/타입/컴포넌트/props)
- 방향: 양방향 (`imports`는 가져오는 쪽, `usedBy`는 사용처)
- 상태 라벨: `[OK]` 변경 불필요 / `[WIP]` 작업 중 / `[TODO]` 작업 예정 / `[BUG]` 현재 결함
- 시드 작업: 댓글 리액션 3종(LIKE/CURIOUS/USEFUL) 프론트 연동

## types/post.ts (타입 허브)

### ReactionType `'LIKE' | 'CURIOUS' | 'USEFUL'`

- usedBy
  - api/posts.ts — togglePostReaction, toggleCommentReaction 인자
  - components/post/ReactionBar.tsx — props.counts 키, props.myReactionType
  - hooks/useReactionToggle.ts — 카운트 키 매핑, GA 이벤트 매핑
  - hooks/useCommentReactionToggle.ts — 동일 패턴

### PostReaction

- imports: ReactionType
- usedBy
  - api/posts.ts (getPostReaction return)
  - hooks/useReactionToggle.ts (state shape)

### CommentReaction `[OK]`

- imports: ReactionType
- usedBy
  - api/posts.ts (toggleCommentReaction, getCommentReaction return)
  - hooks/useCommentReactionToggle.ts (state shape)

### CommentResponse

- 리액션 관련 필드: `likeCount?`, `curiousCount?`, `usefulCount?`, `myReactionType?`
- usedBy
  - api/posts.ts — fetchComments, createComment, updateComment 반환
  - components/post/CommentCard.tsx — props.comment
  - hooks/useCommentReactionToggle.ts — reactionFromCommentResponse 입력
  - pages/post/PostDetailPage.tsx — comments state
  - pages/post/CommentDetailPage.tsx (확인 필요)

### PostDetail

- 리액션 관련 필드: `reactionCounts?`, `myReactionType?`
- usedBy
  - hooks/useReactionToggle.ts — reactionFromPostDetail 입력
  - pages/post/PostDetailPage.tsx, CommentWritePage.tsx, PostEditPage 등

## api/posts.ts

### toggleCommentReaction(commentId, reactionType) `[OK]`

- 시그니처 반환: `Promise<CommentReaction>` (게시글 toggle은 void → 비대칭 박제)
- 엔드포인트: `PUT /comments/:id/reaction`
- imports: axiosInstance, ReactionType, CommentReaction (types/post)
- usedBy
  - hooks/useCommentReactionToggle.ts

### getCommentReaction(commentId)

- usedBy: 현재 호출처 없음 (댓글 목록 응답에 카운트 포함이라 사용 보류 가능)

### togglePostReaction(postId, reactionType)

- 반환: `Promise<void>` (응답 미반영, 낙관 업데이트만)
- usedBy: hooks/useReactionToggle.ts

### fetchComments(postId)

- 어댑터: 백엔드 nested replies[] → flat 배열 평탄화
- usedBy: pages/post/PostDetailPage.tsx, CommentDetailPage

## hooks/useReactionToggle.ts (게시글용, 패턴 원본)

### useReactionToggle(initialReaction)

- imports: togglePostReaction (api), ReactionType/PostReaction (types), trackReaction (analytics)
- 반환: `{ reaction, setReaction, toggling, handleToggle }`
- usedBy
  - pages/post/PostDetailPage.tsx
  - pages/post/CommentWritePage.tsx

### reactionFromPostDetail(post: PostDetail)

- 변환: PostDetail → PostReaction
- usedBy: PostDetailPage, CommentWritePage

## hooks/useCommentReactionToggle.ts `[WIP]`

### useCommentReactionToggle(comments, setComments)

- imports: toggleCommentReaction (api), CommentReaction/ReactionType/CommentResponse (types)
- 반환(예정): `{ togglingId, handleToggle(commentId, type) }`
- usedBy(예정): pages/post/PostDetailPage.tsx, CommentDetailPage

### reactionFromCommentResponse(comment) `[OK]`

- 변환: CommentResponse → CommentReaction
- usedBy: 현재 호출처 없음 — 댓글 목록 자체에 카운트가 포함되어 어댑터 필요성 재검토

### 현재 결함 `[BUG]`

- `reaction` 미정의 — useReactionToggle 복붙 후 단일 객체 시그니처가 배열 시그니처로 미전환
- 낙관 업데이트가 단일 `reaction` 객체 위에서 이뤄짐 → `setComments(prev => prev.map(...))`로 commentId 매칭 갱신해야 함
- 실패 시 rollback도 `prev` 단일 객체에 의존 → 변경 전 댓글 배열 스냅샷이 필요

## components/post/ReactionBar.tsx `[OK]` 재사용 가능

### props

- `counts: Record<ReactionType, number>`
- `myReactionType: ReactionType | null`
- `onToggle: (type: ReactionType) => void`
- `disabled?: boolean`, `size?: number`

### imports

- ReactionType (types/post)
- lucide-react: Heart, Star, Lightbulb

### usedBy

- pages/post/PostDetailPage.tsx
- pages/post/CommentWritePage.tsx
- components/post/CommentCard.tsx `[TODO]` 댓글 리액션 영역 교체 예정

## components/post/CommentCard.tsx `[TODO]`

### props (현재)

- `comment: CommentResponse`
- 편집: `isEditing`, `editSubmitting`, `onEditStart/Submit/Cancel`
- 삭제: `onDelete`
- 답글: `replyCount`, `replyToNickname`, `onMessageClick`

### props (추가 예정)

- `onReactionToggle?: (type: ReactionType) => void`
- `toggling?: boolean` 또는 부모가 `togglingId === comment.id`로 계산해 전달

### 리액션 UI 현재 상태

- lucide Heart/Star/Lightbulb 버튼 하드코딩
- onClick은 `stopPropagation`만, 실제 토글 미연결
- 변경 방향: ReactionBar 재사용 + 부모에서 주입한 핸들러 호출

### usedBy

- pages/post/PostDetailPage.tsx — 최상위 댓글 카드
- pages/post/CommentDetailPage.tsx — 대댓글 포함 (확인 필요)

## pages/post/PostDetailPage.tsx (hot path 1위, 69x)

### 현재 연결

- 게시글 리액션: `useReactionToggle` + `reactionFromPostDetail` → `ReactionBar`
- 댓글 표시: `fetchComments` → `comments state` → `CommentCard` (리액션 미연결)
- 부수: `useCommentSubmit`, `scrapPost/unscrapPost`, `fetchPostImages`

### 추가 예정

- `useCommentReactionToggle(comments, setComments)` 마운트
- `CommentCard`에 `onReactionToggle`, `toggling` 전달 (prop drilling 1단계)

## pages/post/CommentWritePage.tsx

- imports: ReactionBar, useReactionToggle, reactionFromPostDetail, fetchPost, createComment
- 댓글 리액션과 무관 (단일 게시글 미리보기 + 댓글 작성만)

## pages/post/CommentDetailPage.tsx (TODO 확인)

- 대댓글 상세/작성 페이지로 추정
- CommentCard 사용 시 PostDetailPage와 동일하게 useCommentReactionToggle 통합 필요
- 다음 업데이트 시 직접 열어 imports/사용 심볼 노드 추가

## 다음 작업 체크리스트 (이 맵 기준)

- useCommentReactionToggle 시그니처 정합성: 단일 reaction state 제거, comments 배열 위에서 commentId 매칭 갱신
- CommentCard 리액션 영역 ReactionBar로 교체 + props 확장
- PostDetailPage에서 훅 마운트 및 핸들러 주입
- CommentDetailPage 동일 적용
- reactionFromCommentResponse 사용처 결정 (제거 또는 유지)

## 유지보수 규칙

- 새 심볼 추가 시 해당 파일 노드의 `imports`와 사용처 노드의 `usedBy` 양쪽 모두 갱신
- 상태 라벨(`OK/WIP/TODO/BUG`)은 작업 종료 시 업데이트하거나 제거
- 노드가 6개 이상 모인 파일은 별도 파일(`docs/markmap-<도메인>.md`)로 분리 검토
- 작업 종료 시 변경된 import 경로 grep으로 한 번 검증 후 커밋
