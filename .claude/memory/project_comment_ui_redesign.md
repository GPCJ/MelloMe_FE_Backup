---
name: 댓글 UI 리디자인
description: 디자이너 모바일 디자인 기반 댓글 3페이지 구조 + 데스크탑 인라인 분기 (04-07 구현 완료)
type: project
---

## 댓글 UI 리디자인 (04-07)

디자이너가 모바일 해상도 기준 대댓글 작성 UI를 제공, 이를 기반으로 댓글 시스템 UI 전면 리디자인.

### 3페이지 구조

1. **PostDetailPage** (`/posts/:postId`) — 게시글 + 댓글 카드 목록 (1레벨만)
2. **CommentWritePage** (`/posts/:postId/comments`) — 게시글 본문 + 하단 고정 input (1레벨 댓글 작성)
3. **CommentDetailPage** (`/posts/:postId/comments/:commentId`) — 부모 댓글 + 대댓글 목록 + 💬 클릭 시 input 활성화

### 모바일 vs 데스크탑

- **모바일**: 💬 아이콘 → CommentWritePage로 페이지 이동, 하단 nav 숨김
- **데스크탑**: 댓글 수와 목록 사이에 인라인 input + 작성 버튼 표시

### 추가 변경

- CommentCard 공통 컴포넌트 — 리액션 아이콘(하트/댓글/북마크/공유) UI만, 숫자 하드코딩, API 연동 대기
- PostDetailPage에 스크랩 아이콘 추가 (작성자 정보 행 오른쪽 끝)

**Why:** 디자이너의 모바일 퍼스트 디자인 반영 + PWA/Capacitor 전환 시 앱스러운 네비게이션 제공

**How to apply:** 댓글 관련 작업 시 이 3페이지 구조 기준으로 작업할 것. 리액션 API 연동 시 CommentCard의 하드코딩 숫자 교체 필요.

### 다음 세션 작업 방향

- UI 다듬기 중심으로 진행
- **관심사 분리 원칙 적용**: 로직은 hooks (`useComments`, `useReplyInput` 등)로, 컴포넌트는 순수 렌더링만
- 새로 만드는 코드부터 이 패턴 적용 (기존 코드 리팩토링은 별도)
