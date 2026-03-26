---
name: 댓글 시스템 설계
description: 유튜브 스타일 댓글 구현 방향 및 백엔드 논의 필요 항목
type: project
---

유튜브 스타일 댓글 시스템으로 구현 예정 (2026-03-25).

**Why:** depth 제한 없이 대댓글을 달 수 있어야 하지만, 무한 중첩 UI는 피하고 싶어서 유튜브 방식 채택.

**How to apply:** 댓글 UI 작업 시 이 설계 기준으로 구현할 것.

## 구조
- 최상위 댓글 (1레벨)
- 대댓글 (2레벨) — 최상위 댓글 아래 flat하게 쌓임
- 대댓글에 답글 달면 → 같은 2레벨에 추가 + @닉네임 멘션 자동 삽입
- 3레벨 이상 중첩 없음

## 백엔드 논의 필요
- 대댓글의 대댓글 작성 시 `parentCommentId`에 무엇을 넣을지:
  - 원본 최상위 댓글 ID? (백엔드가 flat하게 관리)
  - 바로 위 댓글 ID? (프론트에서 최상위 ID로 변환)
- 현재 API: `POST /posts/:postId/comments { content, parentCommentId? }`
