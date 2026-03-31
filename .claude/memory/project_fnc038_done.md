---
name: FNC-038 대댓글 보완 완료
description: 대댓글에 답글 버튼 추가 — depth 2 제한, @닉네임 멘션 대화 맥락 표시
type: project
---

FNC-038 대댓글 보완 완료 (2026-03-31)

**Why:** 대댓글(reply)에 답글 버튼이 없어서 대댓글 간 대화가 불가능했음.

**How to apply:** PostDetailPage.tsx에서 reply 렌더링 시 onReply prop 추가 완료. depth 2 제한 유지 — 대댓글의 답글은 같은 최상위 댓글(comment.id) 아래에 추가됨.

- 사용자가 직접 코딩하여 구현 (AI 미사용)
- 유튜브 스타일 flat 2레벨 구조: parentCommentId는 항상 최상위 댓글 ID, @닉네임으로 대상 구분
