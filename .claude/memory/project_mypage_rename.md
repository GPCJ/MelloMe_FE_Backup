---
name: 프로필 페이지 명칭 변경 및 탭 구성 확정
description: 마이페이지 → 프로필로 명칭 변경, 탭 구성 확정, 백엔드 요청 현황
type: project
---

## 결정 사항

- 페이지명: **마이페이지 → 프로필**로 변경 확정
- 탭 구성: **내가 쓴 글 / 답글 단 글 / 스크랩** 3개

**Why:** PM 방향 변경

**How to apply:** MyPage 관련 컴포넌트/라우트/텍스트 수정 시 "프로필" 명칭 사용

## API 현황 (2026-03-29 기준)

탭 구성 기준으로 실제 필요한 엔드포인트:
- `GET /me/posts` — 내가 쓴 글 / 백엔드 요청 완료, 응답 대기 중
- `GET /me/comments` (또는 `/me/replies`) — 답글 단 글 / 백엔드 논의 필요
- `GET /me/scraps` — 스크랩 / ✅ 백엔드 구현 완료

기존에 언급된 `GET /me/dashboard`, `GET /me/activity`는 탭 구성과 맞지 않음 → 백엔드 API 논의 시 위 3개로 재정의 요청 필요

기타:
- `GET /posts/:postId` authorId 필드 추가 — 백엔드 요청 완료, 응답 대기 중
- 반응 3종 — 백엔드 병목으로 보류
