---
name: 세션 브릿지
description: 다음 세션에서 바로 이어갈 수 있도록 저장한 일회성 컨텍스트. 다음 /session-bridge 실행 시 정리 예정.
type: project
ephemeral: true
date: 2026-03-24
---

## 중단된 작업
- 랜딩페이지 도입으로 인한 UI 흐름 어색한 부분 식별됨 — 점검 필요

## 다음 즉시 할 것 (우선순위 순)
1. **UI 흐름 점검** — 랜딩페이지 추가로 생긴 어색한 흐름 확인 및 수정
2. **흐름도 디자이너 공유** — 인증 흐름(랜딩→로그인→인증→커뮤니티) 다이어그램 공유
3. **OAuthCallbackPage 구현** — `/auth/callback` 라우트, Google code → `POST /auth/oauth/google/exchange` → setAuth + 라우팅

## 블로킹 / 대기 중
- 치료사 인증 API 연결 — 백엔드와 licenseCode 필드, therapyAreas API, 치료영역 enum 논의 필요
- Figma MCP — plugin 인증 미완료, 스크린샷/Figma to Code 플러그인으로 대체 중

## 참고 컨텍스트
- 이번 세션 완료 목록:
  - `LandingPage.tsx` 신규 생성 (Figma to Code 추출 기반, 반응형 변환)
  - `AuthRoute.tsx` 신규 생성 (로그인만 확인)
  - `App.tsx` — `/` → LandingPage (Layout 밖), `/therapist-verifications` → AuthRoute 하위
  - `GuestRoute.tsx` — canAccessCommunity 분기 (true→/posts, false→/)
  - `ProtectedRoute.tsx` — canAccessCommunity 체크 추가
  - `LoginPage.tsx` — 환영화면 "나중에 하기" → `/`
  - `MyPage.tsx` — 자격 인증 탭 제거
  - `LandingPage.tsx` — auth 상태별 버튼 분기 (비로그인/NOT_REQUESTED/APPROVED)
- 랜딩페이지 버튼 상태: 비로그인→/login, NOT_REQUESTED/PENDING/REJECTED→/therapist-verifications(violet), APPROVED→/posts(green)
- LandingPage는 Layout 밖에 위치 (자체 navbar/footer 보유)
- OAuthCallbackPage 흐름: Google code → `POST /auth/oauth/google/exchange` → setAuth + 라우팅
