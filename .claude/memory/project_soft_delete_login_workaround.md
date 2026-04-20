---
name: 탈퇴 유저 로그인/로그아웃 문제 — 현황
description: 탈퇴 유저 로그인 시 INVALID_CREDENTIALS 통일 문제 + 프론트 인터셉터 버그. 에러코드 분리 대기 중
type: project
---

## 현재 상태 (04-05)

백엔드 배포 완료. 탈퇴 유저 로그인 시 `INVALID_CREDENTIALS` 401 반환 — **일반 로그인 실패와 동일 코드**라 프론트 구분 불가.
→ `DELETED_ACCOUNT` 별도 에러 코드 요청: 아이로 이슈 #3 업데이트 완료, 백엔드 대기 중.

## 해결된 것

- **로그아웃 데드락**: fire-and-forget 방식으로 수정
- **clearAuth localStorage**: persist 미들웨어 경합 방지
- **JWT exp 워크어라운드**: 코드 제거 완료

## 프론트 미수정 버그 2건

1. **인터셉터 로그인 401 refresh 문제** — `/auth/login` 401이 토큰 갱신을 타면서 원래 에러 메시지 유실
2. **LoginPage catch 메시지 추출** — `err.response.data.message` 대신 `err.message`(axios 기본 메시지) 사용 중

**Why:** 에러코드 분리와 무관하게 지금 고쳐야 하는 버그 — 백엔드 에러 메시지가 유저에게 안 보임
**How to apply:** 인터셉터에서 `/auth/` 요청 refresh 스킵 + catch에서 response.data.message 추출
