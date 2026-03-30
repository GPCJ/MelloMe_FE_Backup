---
name: MVP 단일 게시판 정책
description: MVP에서는 게시판 하나만 운영 — board 파라미터 미사용, 다중 게시판은 MVP 이후 검토
type: project
---

MVP 단계에서는 게시판을 하나만 운영.

**Why:** 기획 단계에서 다중 게시판(치료사 게시판/자료 게시판/익명 게시판) 구분이 MVP 범위 밖으로 확정됨.

**How to apply:** `BoardType` 타입 정의는 유지하되, `fetchPosts`의 `board` 파라미터는 실제로 전송하지 않음. 다중 게시판은 MVP 이후 재검토.
