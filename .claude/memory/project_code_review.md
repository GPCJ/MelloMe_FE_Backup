---
name: 코드 리뷰 결과 (2026-03-12)
description: 프론트엔드 MVP 초기 코드 리뷰 미해결 이슈 — 새 기능 개발 전 확인할 것
type: project
---

**How to apply:** 새 기능 개발 전, 아래 🔴 이슈가 해결됐는지 먼저 확인하고 안내할 것.

## 🔴 Critical (미해결)

**공통 fetch 래퍼 없음** (`api/auth.ts`)
- 인증 필요한 API 호출 시 Authorization 헤더 자동 주입 로직 없음
- 공통 `apiFetch()` 유틸 함수 또는 인터셉터 필요

## ✅ 해결 완료

- 토큰 지속성 — Zustand persist로 localStorage 저장 (⚠️ 리팩토링 시 httpOnly Cookie 전환 예정)
- Protected Route — ProtectedRoute/GuestRoute 컴포넌트 구현 완료
- `<a href="/signup">` → `<Link to="/signup">` 수정 완료
- 홈 Route 인라인 JSX → `HomePage.tsx` 분리 완료
- `.env.example` 누락 항목 추가 완료
- `index.html` lang/title 수정 완료
