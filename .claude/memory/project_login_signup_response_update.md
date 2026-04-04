---
name: 로그인/회원가입 응답 구조 변경 (04-04)
description: 백엔드 실제 응답에 맞춰 프론트 수정 완료 + 환영페이지 리다이렉트 버그 미해결
type: project
---

## 변경 완료 (04-04)
- **로그인 응답**: `{ user: { id, email, nickname, profileImageUrl, role, canAccessCommunity, therapistVerification }, tokens: { accessToken, accessTokenExpiresInSec } }`
- **회원가입 응답**: `{ id, email, nickname, accessToken, role }` (flat 구조, 로그인과 다름)
- LoginResponse / SignupResponse 타입 분리
- 로그인 시 getMe() 별도 호출 제거 (네트워크 요청 1회 절감)
- WelcomePage의 getMe() fallback 제거
- MSW 핸들러 응답 형식 동기화

## 미해결 버그
- **회원가입 후 /welcome 안 감**: GuestRoute가 setUser() 감지 → `/`로 리다이렉트해서 navigate('/welcome')보다 먼저 실행됨
- GuestRoute 수정 시도했으나 미완료 상태

**Why:** 기존 코드는 AT만 받고 GET /me로 유저 정보 받는 구조 전제였음
**How to apply:** 인증 관련 코드 수정 시 로그인/회원가입 응답 구조가 다르다는 점 주의
