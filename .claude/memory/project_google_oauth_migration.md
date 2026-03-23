---
name: Google OAuth 백엔드 주도 전환 진행 상황
description: 백엔드 주도 Google OAuth 전환 작업 현황 — 프론트 일부 완료, 콜백 페이지 미구현
type: project
---

백엔드 개발자 노션 페이지("백엔드에서 온 노션 페이지") 기반으로 Google OAuth를 백엔드 주도 방식으로 전환하기로 확정.

**Why:** 보안 민감 로직(code 교환, provider 검증, 계정 연동)을 백엔드에 집중해 운영 안정성 향상. 기존 프론트 주도 방식은 Google이 준 idToken을 프론트가 그대로 넘기는 구조라 보안 일관성이 낮음.

**How to apply:** 콜백 페이지 구현 시 아래 미확정 항목 먼저 백엔드 확인 후 진행.

## 완료된 프론트 작업 (2026-03-23)
- `GoogleLogin` 컴포넌트 → `window.location.href = .../auth/oauth/google/start` 버튼으로 교체
- `GoogleOAuthProvider` 래퍼 및 `VITE_GOOGLE_CLIENT_ID` 제거 (`App.tsx`)
- `googleLogin()` 함수 제거, `getMe()` 함수 추가 (`api/auth.ts`)
- MSW `POST /auth/oauth/google` mock 제거

## 미완료: OAuthCallbackPage
`/auth/callback` 페이지 미구현. 백엔드에서 OAuth 완료 후 프론트로 리다이렉트할 때 **access token 전달 방식이 미확정**이라 보류.

- 후보 A: URL 쿼리 파라미터 `/auth/callback?accessToken=xxx&newUser=true`
- 후보 B: URL 해시 `/auth/callback#accessToken=xxx` (서버 로그 노출 없음, 더 안전)

→ 백엔드 개발자에게 확인 필요: "리다이렉트할 때 accessToken 어떻게 줄 거야?"

## 백엔드 새 엔드포인트
- `GET /api/v1/auth/oauth/google/start` — Google 로그인 페이지로 리다이렉트
- `GET /api/v1/auth/oauth/google/callback` — Google 콜백 처리 후 프론트로 리다이렉트
