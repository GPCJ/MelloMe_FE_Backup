---
name: 회원가입 후 환영 페이지 라우팅 이슈
description: SignupPage(GuestRoute) → WelcomePage 전환 시 GuestRoute/AuthRoute 충돌로 리다이렉트 실패 — 근본 해결 필요
type: project
tags: [UI개발]
---

## 증상
회원가입 후 `/welcome` 페이지가 안 뜸

## 원인 분석
SignupPage는 GuestRoute 안에 있고, WelcomePage는 AuthRoute 안에 있었음 → 어떤 순서로 해도 충돌:
- `setAuth` 먼저 → GuestRoute가 user 감지 → `/`로 리다이렉트 (navigate 도달 전)
- `navigate` 먼저 → AuthRoute가 user 없음 감지 → `/login`으로 리다이렉트

## 현재 임시 조치
- `/welcome`, `/verification-complete`를 AuthRoute 밖으로 뺌 (가드 없음)
- `navigate('/welcome', { replace: true })`를 `setAuth` 전에 호출
- **아직 동작 확인 안 됨** — React 상태 업데이트 타이밍 문제 가능성 있음

## 근본 해결 방향 (추후)
- GuestRoute의 리다이렉트 로직 재설계 필요
- 또는 회원가입 → 로그인 전환 시 라우팅 전략 전체 재검토
- 사용자가 라우트 가드 구조를 먼저 충분히 이해한 후 작업 예정

## 관련 파일
- `frontend/src/components/GuestRoute.tsx` — `if (user) return <Navigate to="/" />`
- `frontend/src/components/AuthRoute.tsx` — `if (!user) return <Navigate to="/login" />`
- `frontend/src/pages/SignupPage.tsx` — navigate + setAuth 순서
- `frontend/src/App.tsx` — 라우트 구조
- `frontend/src/pages/WelcomePage.tsx` — 환영 페이지
- `frontend/src/pages/VerificationCompletePage.tsx` — 인증 완료 페이지
