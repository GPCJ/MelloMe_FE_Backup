---
name: 백엔드 페이지네이션 스펙
description: 백엔드 페이지네이션은 0-based — 프론트에서 변환 필요
type: project
---

백엔드 페이지네이션은 0-based (2026-03-25 확인).

**Why:** 백엔드 Spring Data 기본 방식이 0-based page index.

**How to apply:** `GET /posts?page=...` 등 페이지 파라미터 전송 시 `currentPage - 1` 변환해서 보낼 것. UI는 1-based로 유지.
