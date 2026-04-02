---
name: TipTap 리치텍스트 에디터 제거
description: TipTap→textarea 통일 확정 — 모바일 확장 대비, PC/모바일 포맷 불일치 방지
type: project
---

TipTap 에디터 제거, 단순 textarea로 통일 확정 (2026-04-02).

- RichTextEditor.tsx 삭제
- TipTap 패키지 의존성 제거 (@tiptap/react, @tiptap/starter-kit 등)
- SimpleTextEditor 컴포넌트 신규 생성 (textarea + 글자 수 카운트)
- DOMPurify는 기존 리치텍스트 게시글 렌더링용으로 당분간 유지

**Why:** 모바일 확장 예정이라 마크업 기능은 과함. PC에서만 리치텍스트 지원하면 저장 포맷(HTML vs plain text) 불일치 문제 발생.

**How to apply:** 에디터는 항상 textarea. 나중에 서식이 필요하면 마크다운 경량 지원 검토.
