---
name: 인증 API와 유저 정보 API 관심사 분리 완료
description: 로그인/회원가입 → accessToken만 반환, GET /me → 5개 필드, role 기반 접근 제어로 전환. 백엔드 스펙 변경 요청 필요.
type: project
---

## 인증 API 관심사 분리 (04-04 완료)

### 변경된 스펙

| API | Before | After |
|---|---|---|
| POST /auth/login | `{ user, tokens }` | `{ accessToken }` |
| POST /auth/signup | `{ user, tokens }` | `{ accessToken }` |
| GET /me | 7개 필드 (canAccessCommunity, therapistVerification 포함) | 5개 필드 (id, email, nickname, profileImageUrl, role) |

### 핵심 변경

- `canAccessCommunity` 제거 → `role !== 'USER'`로 대체
- `therapistVerification` 제거 → GET /therapist-verifications/me로 별도 조회
- Zustand store: `setAuth` 제거, `setTokens`/`setUser` 분리
- 프론트 14개 파일 수정 완료, tsc 통과, 코드 리뷰 4건 수정 완료

### 백엔드 요청 필요

**아직 백엔드에 미전달.** 전달할 내용:
1. POST /auth/login, /auth/signup 응답을 `{ accessToken }` 로 간소화
2. GET /me 응답에서 canAccessCommunity, therapistVerification 제거
3. role 필드가 인증 상태를 반영해서 내려오는 것 확인 (USER/THERAPIST/ADMIN)
