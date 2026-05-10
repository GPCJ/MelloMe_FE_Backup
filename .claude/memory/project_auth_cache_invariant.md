---
name: clearAuth = Zustand 초기화 + RQ 캐시 정리 invariant
description: 로그아웃 처리는 auth store 비우기와 React Query 캐시 정리가 한 묶음이라는 정책 결정 (2026-05-10)
type: project
originSessionId: e1edc8fc-ae80-43c0-add1-b97ceec7982e
---
# 로그아웃 시 RQ 캐시 정리 정책 (2026-05-10)

`useAuthStore.clearAuth()`는 두 책임을 한 묶음으로 수행해야 합니다.

1. Zustand auth 상태 초기화 (user/tokens null + localStorage 제거)
2. React Query 전체 캐시 정리 (`queryClient.clear()`)

이 둘은 분리된 책임이 아니라 **하나의 invariant**입니다. 사용자 세션이 바뀌면 이전 사용자가 받은 데이터는 무조건 폐기되어야 합니다.

## 구조

`frontend/src/lib/queryClient.ts`에 싱글턴 export:

```ts
export const queryClient = new QueryClient();
```

- `main.tsx`의 `QueryClientProvider`와 `useAuthStore.clearAuth` 양쪽이 같은 인스턴스 참조
- 모듈 평가 1회 보장으로 동일 객체가 어디서든 import됨

## Why

**발견 경위**: 2026-05-10 CH-02 검증 중 회귀 버그 발견.

- THERAPIST 계정 → 로그아웃 → USER 계정 재로그인 → `/posts` 진입
- 이전 세션의 `['feed']` 캐시가 hit되어 비공개 카드가 블러 없이 노출
- 새로고침하면 정상 (QueryClient 통째로 재생성됨)

원인: `clearAuth`가 Zustand만 초기화하고 RQ 캐시는 그대로 둠.

## How to apply

- **신규 `clearAuth` 호출처 추가 시**: 별도로 `queryClient.clear()` 호출할 필요 없음. store 안에서 자동 통과.
- **현재 호출처 4곳**: UserMenu(로그아웃), ProfilePage(로그아웃/계정 탈퇴), axiosInstance(401 refresh 실패) — 모두 한 번의 fix로 통과.
- **RQ 캐시가 갑자기 비워지는 디버깅 시**: 로그아웃 경로가 통과했는지 첫 단서로 확인.

## 한계

이번 fix는 "로그아웃 시점에 캐시 정리"만 해결합니다. 로그아웃 없이 다른 사용자 세션이 끼어드는 케이스(예: 토큰 탈취)는 가정 밖. RQ의 `staleTime`/`gcTime`을 줄여 더 적극적으로 refetch하는 길은 후속 옵션이지 이번 결정의 대체재가 아닙니다.
