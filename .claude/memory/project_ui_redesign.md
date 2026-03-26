---
name: UI 전면 개편 완료 (2026-03-20)
description: 피그마 와이어프레임 기반 전체 페이지 UI 재작성 완료 현황
type: project
---

피그마 와이어프레임 기반으로 전체 UI 개편 완료 (2026-03-20).

**개편 범위:**
- 로그인 페이지 — 아이콘 인풋, 로그인 상태 유지/비번 찾기(UI only), 이용약관
- 회원가입 페이지 — 배경/타이틀 통일
- 커뮤니티 목록 페이지 — 배너, 검색바(UI only), 필터칩, 카드 개편, 페이지네이션
- 게시글 상세 페이지 — 작성자 아바타, ⋮ 더보기 메뉴, 공감 하트, DOMPurify 적용
- 글쓰기 / 수정 페이지 — RichTextEditor(Tiptap v3), 치료영역 버튼형, 파일첨부(UI only), violet 버튼
- 마이페이지 — 프로필 카드, 탭 스타일 통일
- 네비게이션 바 — gray-900 로고, 알림 드롭다운(UI only), 프로필 드롭다운

**추가 작업:**
- RichTextEditor — Tiptap v3 기반 (Bold, Italic, H2, 목록, 인용구, undo/redo)
- DOMPurify XSS 방어 — dangerouslySetInnerHTML 사용 부분에 적용

**완료:**
- Notion 트러블슈팅 #003 (DOMPurify XSS 방어) — 작성 완료 (2026-03-19)

**Why:** 피그마 와이어프레임 기반으로 팀 공유 가능한 수준의 UI 완성. Vercel 배포 후 팀원 체험 가능 상태.

**How to apply:** UI 관련 작업 시 개편 완료된 페이지 기준으로 이어서 진행.
