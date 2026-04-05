---
name: 탈퇴 유저 로그인/로그아웃 문제 — 현황
description: 탈퇴 유저 로그인 시 정상 토큰 발급 + 로그아웃 데드락 해결 이력. 백엔드 에러 응답 배포 대기 중
type: project
---

## 현재 상태 (04-05)

백엔드가 탈퇴 유저 로그인 시 **에러 응답 반환하도록 수정 완료했으나 미배포**. 배포 후 프론트 catch에서 에러 코드 분기 추가 필요.

## 해결된 것: 로그아웃 데드락

탈퇴 계정으로 로그인된 상태에서 로그아웃 불가 버그 → **인터셉터 데드락**이 근본 원인.
- refresh 요청이 같은 axiosInstance를 사용 → refresh 자체가 401 시 자기 큐에 걸림 → `isRefreshing` 영원히 `true`
- `await logout()`이 큐에서 무한 대기 → 이후 `clearAuth()`, `navigate()` 실행 안 됨
- **수정**: fire-and-forget 방식 — `clearAuth()` + `navigate('/login')` 먼저, `logout().catch(() => {})` 나중

## 해결된 것: clearAuth localStorage

`clearAuth()`에 `localStorage.removeItem('auth-storage')` 명시 추가 — persist 미들웨어 경합 방지.

## 무력화된 것: JWT exp 워크어라운드

백엔드가 탈퇴 유저에게 **더 이상 만료된 AT를 주지 않음** (정상 30분 토큰 발급 확인).
→ JWT exp 체크 코드 제거 완료 (04-05). `canAccessCommunity: false`도 일반 미인증 유저와 동일하여 판별 불가.

## 남은 작업

백엔드 배포 후:
1. 탈퇴 유저 로그인 시 백엔드 에러 응답 확인 (상태코드 + 에러코드)
2. `LoginPage.tsx` catch에서 에러 코드 분기 추가 (TODO 주석 위치)

**Why:** 프론트만으로 탈퇴 유저 판별 불가 — 응답에 구분 필드 없음
**How to apply:** 백엔드 배포 소식 오면 즉시 디버그 + 프론트 분기 구현
