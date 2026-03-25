---
name: Google OAuth 코드 삭제 내역 (2026-03-25)
description: 회원가입+치료사인증 통합 플로우로 전환하면서 Google OAuth 관련 코드를 git 히스토리 복원 방식으로 삭제 — 나중에 재도입 시 참고
type: project
---

Google OAuth를 일단 제거하고 일반 회원가입+치료사인증 통합 플로우로 전환 (2026-03-25).

**Why:** 치료사 인증 없이는 서비스 이용 불가한데, 구글 로그인 후 인증까지 유도하는 UX보다 회원가입 시 한 번에 처리하는 게 낫다는 판단.

**How to apply:** 나중에 Google OAuth 재도입 시 git 히스토리에서 아래 파일/함수 찾아서 복원. 단, 백엔드 방식도 바뀔 수 있으니 코드 그대로 쓰기보단 참고용으로만 사용.

---

## 삭제된 코드 목록

### 파일 전체 삭제
- `frontend/src/pages/OAuthCallbackPage.tsx` — Google OAuth 콜백 처리 페이지

### 함수 삭제
- `frontend/src/api/auth.ts` — `exchangeOAuthCode(code, redirectUri)` 함수
  - `POST /auth/oauth/google/exchange` 호출, AuthResponse 반환

### UI/로직 삭제 (LoginPage.tsx)
- `handleGoogleLogin()` 함수 — `window.location`으로 `/auth/oauth/google/start` 이동
- Google 로그인 버튼 UI (SVG 아이콘 포함)
- `isNewUser` 환영 화면 로직 — `pendingAuth`, `newUserNickname` state 및 환영 화면 JSX

### 라우트 삭제 (App.tsx)
- `<Route path="/auth/callback" element={<OAuthCallbackPage />} />`
