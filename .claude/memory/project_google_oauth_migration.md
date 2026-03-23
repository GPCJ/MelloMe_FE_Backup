---
name: Google OAuth 전환 진행 상황
description: Google OAuth 전환 작업 현황 — 토큰 교환 방식 확정, OAuthCallbackPage 구현 예정
type: project
---

Google OAuth 토큰 전달 방식 최종 확정 (2026-03-23).

**Why:** 기존 이메일 로그인과 동일한 패턴(accessToken body 응답)으로 통일해 일관성 유지. 백엔드가 Google과 직접 code 교환해 보안 강화.

**How to apply:** OAuthCallbackPage 구현 시 아래 확정된 흐름 그대로 적용.

## 확정된 흐름
1. 프론트가 Google 인증 화면으로 이동 (`response_type=code`)
2. Google이 프론트 콜백 URL로 `code` 전달
3. 프론트가 `POST /api/v1/auth/oauth/google/exchange` 호출 (`code`, `redirectUri`)
4. 백엔드 응답: `accessToken` (body) + `refreshToken` (httpOnly Cookie) — 이메일 로그인과 동일

## 완료된 프론트 작업 (2026-03-23)
- `GoogleLogin` 컴포넌트 → `window.location.href = .../auth/oauth/google/start` 버튼으로 교체
- `GoogleOAuthProvider` 래퍼 및 `VITE_GOOGLE_CLIENT_ID` 제거 (`App.tsx`)
- `googleLogin()` 함수 제거, `getMe()` 함수 추가 (`api/auth.ts`)
- MSW `POST /auth/oauth/google` mock 제거

## 미완료: OAuthCallbackPage
`/auth/callback` 페이지 미구현. 위 확정된 흐름 기반으로 구현 예정.
- Google에서 받은 `code`를 읽어 `POST /auth/oauth/google/exchange` 호출
- 응답 받아 기존 `login()` 이후 처리와 동일하게 `setAuth` + 라우팅
