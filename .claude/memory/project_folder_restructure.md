---
name: 프론트 폴더 구조 리팩토링 (04-07)
description: components/와 pages/를 도메인별 하위 폴더로 재구성 — import 경로 변경됨
type: project
---

2026-04-07 components/와 pages/를 flat 구조에서 도메인별 하위 폴더로 재구성 완료.

## 변경된 구조

```
components/
├── auth/       → AuthRoute, GuestRoute, ProtectedRoute
├── common/     → Pagination
├── layout/     → Layout
├── post/       → PostCard, ReactionBar, CommentCard, FilePreviewGrid,
│                 SimpleTextEditor, VerifiedBadge
└── ui/         → shadcn (변경 없음)

pages/
├── auth/       → LoginPage, SignupPage, TherapistVerificationPage, VerificationCompletePage
├── post/       → PostListPage, PostDetailPage, PostCreatePage, PostEditPage, CommentWritePage
├── profile/    → ProfilePage
├── search/     → SearchPage
├── HomePage.tsx      (루트 유지)
├── LandingPage.tsx   (루트 유지)
└── NotFoundPage.tsx  (루트 유지)
```

## 주의사항
- 모든 import 경로가 변경됨 (상대 경로 `../` → `../../` 등)
- `@/components/ui/*` 경로는 변경 없음 (shadcn ui 폴더 위치 불변)
- 새 컴포넌트 추가 시 해당 도메인 하위 폴더에 배치할 것
- App.tsx의 import도 모두 하위 폴더 경로로 업데이트됨
- tsc -b 빌드 검증 완료 (에러 0)

**Why:** flat 구조에서 컴포넌트가 많아지면서 관련 파일 찾기 어려움. 하위 컴포넌트 추출 시 도메인 폴더만 열면 관련 파일만 보이도록 개선.
**How to apply:** 새 컴포넌트/페이지 생성 시 반드시 도메인 하위 폴더에 배치. 예: 게시글 관련 → `components/post/`, `pages/post/`
