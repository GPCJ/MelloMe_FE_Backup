---
name: 백엔드 로그인 응답 구조 불일치
description: 백엔드 로그인 응답 구조 수정 요청 — 프론트 타입은 최신화 완료, 백엔드 구현 대기 중
type: project
---

백엔드 로그인 응답 구조는 yaml 기준 이미 올바른 포맷으로 되어 있음 (2026-03-20 확인).
Refresh Token httpOnly Cookie 방식도 완료됨. 프론트에서 axios 인터셉터로 래퍼 처리만 하면 됨.

**확정된 응답 포맷 (yaml 확인 완료):**
```http
HTTP/1.1 200 OK
Set-Cookie: refreshToken=bNhc...; HttpOnly; Secure; Path=/auth/reissue; SameSite=Strict; Max-Age=1209600

{
  "isNewUser": false,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "닉네임",
    "profileImageUrl": null,
    "role": "USER",
    "canAccessCommunity": false,
    "therapistVerification": {
      "status": "NOT_REQUESTED",
      "requestedAt": null,
      "reviewedAt": null,
      "rejectionReason": null
    }
  },
  "tokens": {
    "accessToken": "eyJ...",
    "accessTokenExpiresInSec": 1800
  }
}
```

**적용 엔드포인트:** `POST /auth/login`, `POST /auth/signup`, `POST /auth/oauth/google`

**프론트 타입 변경 완료 (2026-03-15):**
- `therapistVerification`: null 제거 → 항상 객체, `NOT_REQUESTED` 상태 추가, `id`/`createdAt`/`rejectReason` 제거, `requestedAt`/`rejectionReason` 추가
- `Tokens`: `refreshToken`, `refreshTokenExpiresInSec` 제거 (httpOnly Cookie로 이동)

**Why:** 로그인 후 user 정보가 없어 setAuth 호출 실패 → 로그인 상태 저장 안 됨

**How to apply:** 로그인 응답 구조는 yaml 기준 완료. CORS 반영되면 실제 백엔드 로그인 테스트 가능.
순서: CORS 완료 → 로그인 테스트 → 콘솔 스크립트로 게시글 19개 일괄 삽입 → 전체 기능 테스트
