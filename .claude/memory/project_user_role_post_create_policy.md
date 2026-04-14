---
name: USER 롤 게시글 작성 정책 변경 — 공개글만 허용
description: USER 롤도 게시글 작성 가능, 단 isPublic=true 공개글만. 비공개글은 THERAPIST/ADMIN 전용
type: project
originSessionId: 1c5f9820-1e8b-4d01-bbca-a067d9627bb2
---
USER 롤 사용자도 게시글 작성이 가능하며, **공개글(isPublic=true)만 작성 가능**. 비공개(인증 전용) 게시글은 여전히 THERAPIST/ADMIN만 작성 가능.

**Why:** 커뮤니티 진입 장벽을 낮추기 위한 정책 완화. 기존에는 ProtectedRoute가 USER의 `/posts/new` 진입을 전면 차단했음.

**How to apply:**
- `components/auth/ProtectedRoute.tsx:7` — USER 전면 차단 로직 수정 필요. `/posts/new`는 USER도 허용하되 비공개 작성/수정 시도는 막아야 함
- `App.tsx:56-57` — `/posts/new`를 ProtectedRoute 밖으로 빼거나 별도 가드 필요
- PostCreatePage — USER면 isPublic 토글을 true로 고정/disable 처리
- PostEditPage — 동일하게 USER가 비공개로 전환 못하게
- 글쓰기 버튼 노출 조건도 함께 확인 (Layout/FAB 등)
- 백엔드 정책 일치 여부 확인 필요 (프론트 가드만으로는 부족)
