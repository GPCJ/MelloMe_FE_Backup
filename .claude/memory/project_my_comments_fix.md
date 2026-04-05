---
name: 내 댓글 탭 응답 형식 수정 완료
description: /me/comments 백엔드 응답 형식에 프론트 타입/UI 맞춤 — 프로필 페이지 답글 단 글 탭 정상화
type: project
---

`/me/comments` 백엔드 실제 응답이 프론트 타입(`MyCommentedPost`)과 불일치하여 프로필 페이지 흰 화면 발생.

**수정 내용 (04-05):**
- 타입: `MyCommentedPost`(post 포함 구조) → `MyComment`(commentId, content, postId, createdAt, isDeleted)
- UI: PostCard 대신 CommentItem 컴포넌트 — 댓글 내용 + 날짜 표시, 클릭 시 해당 게시글로 이동
- 백엔드 수정 요청 없이 프론트가 실제 응답에 맞춤

**Why:** 백엔드가 댓글 단독 정보만 반환하고 게시글 정보를 포함하지 않음. 추가 API 호출 없이 단순하게 해결.
**How to apply:** 향후 백엔드가 게시글 정보 포함 응답으로 변경하면 PostCard 방식으로 되돌릴 수 있음.
