---
name: 세션 브릿지
description: 다음 세션에서 바로 이어갈 수 있도록 저장한 일회성 컨텍스트. 다음 /session-bridge 실행 시 정리 예정.
type: project
ephemeral: true
date: 2026-03-24
---

## 완료된 작업 (이번 세션)
- push-airo 스쿼시 방식으로 변경 — airo 레포 커밋 히스토리에 Claude 관련 커밋 안 보이도록 개선
- 테스트 데이터 삽입 정책 결정 — 프론트에서 직접 삽입 안 하고 백엔드에 요청

## 중단된 작업
- 없음

## 다음 즉시 할 것 (우선순위 순)
1. **OAuthCallbackPage 구현** — `/auth/callback` 라우트, `code` 파라미터 읽어 `POST /auth/oauth/google/exchange` 호출, 응답 받아 `setAuth` + 리다이렉트
2. 전체 기능 테스트 — 테스트 데이터는 백엔드에 요청 후 진행
3. 치료사 인증 API 연결 — 백엔드 논의 후 진행

## 블로킹 / 대기 중
- CORS OPTIONS 403 재발 — 백엔드 수정 대기 중
- 치료사 인증 API 연결 — 백엔드 논의 후 진행
- 루트 .env 미생성 — GOOGLE_CLIENT_ID/SECRET 받으면 바로 생성 가능

## 참고 컨텍스트
- OAuthCallbackPage 흐름: Google code → `POST /auth/oauth/google/exchange` (code, redirectUri) → accessToken(body) + refreshToken(httpOnly Cookie) → `setAuth` + 라우팅
- 기존 이메일 로그인 응답 처리와 동일 패턴 적용
- `project_google_oauth_migration.md`에 확정된 흐름 상세 기록됨
- push-airo는 이제 스쿼시 방식 — airo/main 기준 초기화 후 main 변경분 뭉쳐서 커밋 1개로 push
