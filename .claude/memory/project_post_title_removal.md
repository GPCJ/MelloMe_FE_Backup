---
name: 게시글 title 필드 제거
description: 프론트에서 제목 입력 제거, 빈 문자열 임시 전송 — 백엔드 optional/삭제 요청 필요
type: project
---

게시글 작성 시 title 입력 필드 제거 확정 (2026-04-02).

- 프론트: title input 제거, API 전송 시 `title: ""` 빈 문자열
- 백엔드: title 필드 optional 또는 삭제 요청 필요 (대기 항목)
- 게시글 조회 시 기존 title이 있는 글은 표시 여부 미정 (현재는 표시 안 함)

**Why:** 디자이너 피그마에 제목 필드 없음. 팀 합의로 본문만 작성하기로 결정.

**How to apply:** PostCreatePage/PostEditPage에서 title 제거. 백엔드 required 에러 방지를 위해 빈 문자열 전송.
