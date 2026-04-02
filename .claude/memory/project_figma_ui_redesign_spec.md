---
name: 피그마 UI 리디자인 스펙 확정
description: 2026-04-02 피그마 기반 전체 UI 리디자인 결정사항 — 제목 제거, textarea 통일, 리액션 3종, 프로필 3탭, 검색 페이지 등
type: project
---

피그마 와이어프레임 기반 UI 리디자인 스펙 확정 (2026-04-02).

**주요 결정:**
- 게시글 제목(title) 제거 (빈 문자열 임시 전송)
- TipTap → 단순 textarea 통일 (모바일 확장 대비)
- 연령대(AgeGroup) 선택 제거
- 리액션 3종: 하트(EMPATHY)/별(APPRECIATE)/전구(HELPFUL), Lucide 임시 아이콘
- 프로필 페이지: 대시보드 제거 → 프로필 헤더 + 3탭(내가 쓴 글/답글 단 글/스크랩)
- 검색: 별도 페이지 `/search` (AuthRoute)
- 모바일 헤더: "치료사 커뮤니티" + 검색 아이콘만
- 게시물 열람 라우트: ProtectedRoute → AuthRoute 변경
- 치료영역 5개 유지 (확장 추후 결정)

**스펙 문서:** `docs/superpowers/specs/2026-04-02-figma-ui-redesign.md`

**Why:** 디자이너 피그마 작업물 기반으로 현재 코드와 차이를 분석하여 확정된 범위만 구현하기로 함.

**How to apply:** 새 세션에서 스펙 문서 읽고 writing-plans 스킬로 구현 계획 작성 후 진행.
