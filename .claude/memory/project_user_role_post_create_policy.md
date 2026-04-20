---
name: USER 롤 게시글 작성 정책 변경 — 공개글만 허용 (구현 완료)
description: USER 롤도 게시글 작성 가능, 공개글만. 2026-04-14 main 머지 완료, 백엔드 권한 필드 도입 전 프론트 role 기반 임시 가드
type: project
originSessionId: 1c5f9820-1e8b-4d01-bbca-a067d9627bb2
---
USER 롤 사용자도 게시글 작성이 가능하며, **공개글(isPublic=true)만 작성 가능**. 비공개(인증 전용) 게시글은 THERAPIST/ADMIN만 작성 가능.

**Why:** 커뮤니티 진입 장벽을 낮추기 위한 정책 완화. 기존에는 `ProtectedRoute`가 USER의 `/posts/new` 진입을 전면 차단했음.

## 구현 완료 (2026-04-14, main 770e7af)

- `App.tsx` — `/posts/new`, `/posts/:postId/edit`을 `ProtectedRoute` → `AuthRoute`로 이동
- `components/auth/ProtectedRoute.tsx` — 삭제 (참조처 0)
- `PostCreatePage` / `PostEditPage` — `isPublicOnly = user?.role === 'USER'`로 isPublic 토글 `disabled`, `togglePublic` 헬퍼로 우회 차단, `aria-describedby='visibility-lock-helper'` + 헬퍼 텍스트 "치료사 인증 후 비공개 게시글 작성이 가능합니다."
- `mocks/handlers/posts.handlers.ts` — POST/PATCH에서 `role !== THERAPIST && !== ADMIN` + `visibility === 'PRIVATE'`이면 403 반환 (백엔드 정책 시뮬레이션)

## 팀 논의 대기 안건

1. **백엔드 권한 필드 도입** — 프론트 role 기반 체크는 임시. 백엔드에서 `canWritePrivatePost` 같은 권한 필드를 내려주면 프론트 role 체크 제거하고 필드 기반으로 이관.
2. **과거 THERAPIST가 USER로 롤 변경된 경우 비공개 글 수정 UX** — 저장 시 백엔드 403 → 현재 catch는 일반 메시지로만 표시. 에러 분기로 권한 안내 개선 또는 편집 자체 차단 고려. 매우 드문 엣지 케이스로 예상.

## 관련

- 정책 논의 과정: 사용자가 A(백엔드 필드) vs B(프론트 role) 중 "B로 임시 구현 + 백엔드 필드 요청을 이슈로 등록" 절충안 선택
- 백엔드는 USER의 visibility=PRIVATE 요청을 403으로 거부하는 로직 이미 구현됐다고 사용자 확인
