---
name: 게시물 열람 권한 정책
description: 게시물 열람은 로그인 필수. 비로그인 유저 접근 불가. 추후 공유 기능 추가 시 재논의.
type: project
---

**결정 (2026-03-13):** 비로그인 유저는 게시글 목록/상세 열람 불가. 모든 게시글 관련 라우트는 ProtectedRoute 적용.

**Why:** MVP 단계에서는 커뮤니티 폐쇄성 유지. 추후 공유 기능 추가 시 재논의 예정.

**How to apply:** 게시글 관련 라우트는 전부 ProtectedRoute 안에 넣을 것. API도 Authorization 헤더 필수.
