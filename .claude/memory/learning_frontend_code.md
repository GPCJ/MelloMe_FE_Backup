---
name: 프론트엔드 코드 학습 내용
description: 복습 요청 시에만 사용 — 멜로미 프론트엔드 코드 학습 세션 전체 내용 정리
type: project
---

코드 리뷰 워크트리에서 프론트엔드 전체 코드를 순서대로 학습 완료.

**Why:** LLM 없이 유지보수할 수 있을지 불안함 — 코드를 설명 가능한 수준으로 이해하는 게 목표.

---

## 1. Vite
빠른 개발 서버 + 번들러. HMR(저장 즉시 반영), ES Module 기반. 프로덕션 빌드는 Rollup 사용.

## 2. TypeScript
JS에 타입을 추가해 실행 전에 오류 잡는 도구. 백엔드와의 API 계약을 타입으로 표현.

## 3. Tailwind CSS v4
CSS를 클래스명으로 직접 작성. v4는 설정 파일 없이 CSS 파일 한 줄(`@import "tailwindcss"`)로 작동.

## 4. package.json
프로젝트 의존성 목록. `dependencies`(런타임), `devDependencies`(개발용) 구분.
주요 패키지: react, react-router-dom, zustand, msw, @react-oauth/google, shadcn/ui 관련

## 5. vite.config.ts
- `server.proxy`: `/api` 요청을 백엔드로 프록시 → CORS 우회
- `resolve.alias`: `@/` → `src/` 경로 별칭 (shadcn 세팅으로 추가)

## 6~8. tsconfig / index.css / utils.ts (건너뜀)
- tsconfig: `paths: { "@/*": ["./src/*"] }` 추가됨 (shadcn)
- index.css: CSS 변수 기반 라이트/다크 테마 (shadcn init으로 주입)
- utils.ts: `cn()` = clsx + tailwind-merge (클래스 충돌 방지)

## 9. types/auth.ts
백엔드 API 응답 형태를 TypeScript 타입으로 정의한 "계약서".
`MeResponse`, `Tokens`, `AuthResponse`, `UserRole`

## 10. api/auth.ts
백엔드와 통신하는 함수 모음. `handleResponse()`로 에러 처리 공통화.
`login()`, `signup()`, `googleLogin()`

## 11. useAuthStore.ts
Zustand로 전역 인증 상태 관리. `persist` 미들웨어로 localStorage 저장 → 새로고침 후에도 로그인 유지.
`setAuth()`, `clearAuth()`

## 12. main.tsx
앱 시작점. MSW 조건부 부트스트랩 후 `<App />` 렌더링.
`VITE_MSW_ENABLED=true`일 때만 가짜 서버 활성화.

## 13. App.tsx
라우팅 설계. `<Layout>`을 최상위로 감싸고 내부에 GuestRoute/ProtectedRoute로 접근 제어.

## 14. Layout.tsx
헤더 + 모바일 하단 탭바. `<Outlet />`으로 자식 페이지를 렌더링하는 공통 껍데기.

## 15. ProtectedRoute / GuestRoute
- `ProtectedRoute`: 비로그인 시 `/login` 리다이렉트
- `GuestRoute`: 로그인 시 `/` 리다이렉트

## 16. LoginPage.tsx
`handleSubmit`에서 `async/await`로 `login()` 호출. 성공 시 `setAuth()` → `navigate('/')`.
isNewUser이면 환영 화면 표시.

## 17. SignupPage.tsx
`signup()` 후 바로 `login()` 연달아 호출 → 자동 로그인 처리.

## 18. MSW (handlers.ts / browser.ts)
브라우저에서 네트워크 요청을 가로채 가짜 응답 반환.
핸들러: `/auth/login`, `/auth/oauth/google`, `/meta/options`, `/home`, `/me`
테스트 계정 3개: testUser, testTherapist, admin (비번 모두 `1111`)

## 19. 전체 데이터 흐름
```
main.tsx(시작)
→ App.tsx(라우팅)
→ LoginPage(입력)
→ api/auth.ts(fetch)
→ useAuthStore(setAuth → localStorage)
→ navigate('/')
→ Layout 헤더에 로그인 상태 반영
```
새로고침 시: useAuthStore가 localStorage에서 user/tokens 자동 복원.
