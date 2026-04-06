---
name: 노션 업로드 대기 초안
description: 다른 기기에서 노션에 올릴 초안 — pull-mello 후 확인
type: project
---

# 노션 업로드 대기 초안

---

## 트러블슈팅 #005: 탈퇴 계정 로그인 시 무한 로딩 (axios 인터셉터 데드락) (04-06)

**대상 페이지:** 트러블슈팅 기록
**URL:** https://www.notion.so/322c8200749b81f39f71f9c8a4d6eb44

# #005 — 탈퇴 계정 로그인 시 무한 로딩 (axios 인터셉터 데드락)

**날짜**: 2026-04-06
**분류**: 인증 / axios 인터셉터
**난이도**: ⭐⭐⭐

## 문제 상황
소프트 삭제(탈퇴) 처리된 계정으로 로그인을 시도하면 "로그인 중..." 상태가 영원히 풀리지 않는 버그가 발생했다. 에러 메시지도 표시되지 않고, 버튼도 비활성 상태로 멈췄다.

## 원인 분석
axios 응답 인터셉터에서 401 에러 발생 시 자동으로 refresh 토큰을 사용해 access token을 재발급받는 로직이 있다. 문제는 이 refresh 요청 자체도 같은 axios 인스턴스를 사용하기 때문에, refresh가 401로 실패하면 동일한 인터셉터를 다시 탄다는 것이다.

**데드락 발생 흐름:**
1. 로그인 요청 → 서버 401 응답
2. 인터셉터가 401을 감지 → `isRefreshing = true` → refresh 요청 발송
3. refresh도 401로 실패 → 인터셉터가 다시 401을 감지
4. `isRefreshing`이 이미 `true`이므로 refresh 요청이 대기 큐(`failedQueue`)에 들어감
5. 큐를 해소하는 `processQueue()`는 refresh의 `await`가 끝나야 호출됨
6. 그런데 그 `await`에 걸린 Promise가 바로 큐에서 대기 중인 요청 → **순환 의존으로 영원히 pending**

`finally` 블록에 도달할 수 없으므로 `setLoading(false)`가 실행되지 않아 무한 로딩이 발생한 것이다.

## 해결 과정
refresh 요청에 `_retry: true` 플래그를 붙여서, refresh의 401 응답이 인터셉터의 토큰 갱신 로직을 타지 않고 바로 `Promise.reject`되도록 수정했다. 이렇게 하면 `catch` → `clearAuth()` → `finally` → `setLoading(false)` 순서로 정상 진행된다.

장기적으로는 refresh 전용 axios 인스턴스를 분리하는 것이 더 깔끔한 구조이므로, 리팩토링 시점에 전환 예정이다.

## 핵심 개념
- **데드락(Deadlock)**: A가 끝나야 B가 실행되고, B가 끝나야 A가 실행되는 순환 의존 상태. 이 경우 `processQueue()` 호출 ↔ refresh Promise 해소가 서로를 기다렸다.
- **axios 인터셉터의 재귀성**: axiosInstance 내부에서 axiosInstance를 사용하면 그 요청도 동일한 인터셉터를 탄다. 어떤 요청이 인터셉터를 타야 하고 어떤 요청은 타면 안 되는지 구분이 필요하다.

## 면접 포인트
- Q: "axios 인터셉터에서 토큰 갱신 시 주의할 점은?"
- A: refresh 요청이 같은 인터셉터를 타면 데드락이 발생할 수 있다. refresh 요청은 토큰 갱신 로직을 우회하도록 플래그를 붙이거나, 별도 axios 인스턴스를 사용해야 한다.
