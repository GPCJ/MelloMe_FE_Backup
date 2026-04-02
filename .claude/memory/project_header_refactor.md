---
name: 헤더 검색/글쓰기 버튼 PostListPage로 이동
description: 데스크탑 검색바·글쓰기 버튼을 헤더에서 제거하고 PostListPage 상단으로 이동
type: project
---

헤더 UI 정리 완료 (2026-04-02)

**Why:** 헤더에 로그인/글쓰기/검색이 함께 노출되는 게 어색해서 분리.

**변경 내용:**
- `Layout.tsx`: 데스크탑 검색바, 글쓰기 버튼 제거
- `PostListPage.tsx`: 탭 위에 `hidden md:flex`로 검색바 + 글쓰기 버튼 추가
- 모바일 검색 아이콘(헤더)은 유지
- 로그인 버튼은 헤더에 그대로 유지

**How to apply:** 다른 페이지 헤더 수정 시 로그인 버튼은 헤더 잔류, 기능성 버튼은 페이지 내부로 배치하는 패턴 유지.
