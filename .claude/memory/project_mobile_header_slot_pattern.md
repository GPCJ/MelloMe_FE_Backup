---
name: MobilePageHeader rightAction slot 패턴
description: MobilePageHeader 컴포넌트가 rightAction slot으로 오른쪽 영역을 페이지에서 주입받는 구조 — 리팩토링 시 참고
type: project
originSessionId: 402ee3db-aa77-4508-898f-e145048257e3
---
MobilePageHeader는 `rightAction?: ReactNode` slot 패턴으로 오른쪽 영역 UI를 각 페이지에서 주입받는 구조.

- `backTo?`: 있으면 ← 뒤로가기 + 타이틀, 없으면 타이틀만
- `rightAction?`: 페이지별로 다른 아이콘/버튼을 ReactNode로 전달

**현재 사용처:**
- PostListPage: 검색 아이콘 (Search) → `/search` 이동
- CommentWritePage: 케밥 메뉴 (MoreVertical)
- CommentDetailPage: 케밥 메뉴 (MoreVertical)

**Why:** variant나 route 분기 대신 slot을 선택한 이유 — props 단순(3개), 새 페이지 추가 시 컴포넌트 수정 불필요, 관심사 분리(레이아웃 vs 콘텐츠)

**How to apply:** 리팩토링 시점 판단 기준
- 버튼 className 중복이 5곳 이상으로 늘어나면 → 스타일을 MobilePageHeader 내부로 감싸는 방식 검토
- `rightAction={{ icon, onClick }}` 객체 형태로 변경하여 스타일 통일 가능
