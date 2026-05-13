---
name: rq-learning-pr19
description: PR
metadata: 
  node_type: memory
  type: project
  originSessionId: 397eece1-6043-44d6-893a-8b878ff710d8
---

# PR #19 RQ 학습 진행 상황 (2026-05-13)

## 재개 트리거
사용자가 다음 중 하나 발화 시 이 파일 로드 후 [다음 시작점]부터 재개:
- "RQ 학습 이어가자"
- "RQ 학습 계속" / "RQ 학습 B단계"
- "PR #19 RQ"

재개 시 동작:
1. 이 파일을 다시 읽고 학습 진행 규칙 준수
2. 5단계(옵티미스틱 B)부터 시작 — "이전 단계는 다 끝났고 오늘은 옵티미스틱 패턴부터 갈게요" 같이 한 문장 앵커
3. 한 단계 끝낼 때마다 사용자 "다음" 신호 기다리기
4. 단계 완료 시 이 파일의 체크 표시(⏭ → ✅) 갱신

## 학습 대상
- PR #19 `fix/notification-review-followup` → `develop`
- 핵심 파일: `frontend/src/pages/notification/NotificationPage.tsx` (109/-37)
- 패턴: `useState+useEffect` 수동 fetch → `useQuery` + `useMutation` × 3 (옵티미스틱)

## 5단계 커리큘럼

### 1단계 — RQ의 효용 ✅ skip
사용자가 이미 알고 있어서 건너뜀. (Zustand vs RQ, 서버 상태 = 서버가 진실 등)

### 2단계 — queryKey 문법 ✅ 완료
핵심 합의 내용:
- queryKey = 캐시 주소 (RQ 내부 `Map<주소, 데이터>`의 키)
- 배열인 이유 = 계층적 식별자 (도메인 + 파라미터)
- `['notifications', page - 1]` 두 번째 자리 = useEffect 의존성 배열과 동일한 역할
- `page - 1` 이유 = 백엔드 0-based 페이지네이션 (UI 1-based → 변환)
- 규칙: **queryFn 안에서 쓰는 외부 변수는 모두 queryKey에 박는다**
- `as const` = 튜플 타입 고정 (제네릭 추론용, 동작엔 영향 없음)

### 3단계 — keepPreviousData ✅ 완료
핵심 합의 내용:
- 깜빡임 원인 = queryKey 바뀌면 `data`가 잠깐 `undefined` + `isLoading=true`
- keepPreviousData 효과 = 새 슬롯이 빌 때 직전 슬롯의 data를 placeholder로 빌려옴
- `data`는 한 번도 undefined가 안 됨 → 깜빡임 없음
- 플래그: `isPlaceholderData=true`, `isLoading=false`, `isFetching=true`
- 실체: `placeholderData: (prev) => prev` 와 동등
- 비유: 피팅룸에서 옛 옷 입은 채로 새 옷 갈아입기
- 응용: NotificationPage.tsx:51 `loading = isLoading` → 첫 진입에만 발동, 페이지 전환 시 미발동

### 4단계 — useMutation A (본질·기본) ✅ 완료
핵심 합의 내용:
- useQuery vs useMutation 비교표 (읽기 vs 쓰기 / 자동 vs 수동 / 캐시키 유 vs 무)
- 비유: 구독(useQuery) vs 전화 걸기(useMutation)
- mutationFn은 인자 1개만 받음 (여러 개면 객체로 묶기)
- `.mutate(args)` 트리거, `.mutateAsync` Promise 반환
- 훅 상태: `isPending`, `isSuccess`, `isError`, `data`, `error`, `reset()`
- 콜백 4총사 + 타이밍:
  ```
  .mutate(args)
    → onMutate(args) [return = context]
    → mutationFn(args)
    → onSuccess(data, args, context) | onError(error, args, context)
    → onSettled(data?, error?, args, context)
  ```
- 콜백 용도: onMutate=옵티미스틱, onSuccess=캐시 갱신/토스트, onError=롤백, onSettled=invalidateQueries
- 미답 확인 질문 (사용자가 다음 단계로 넘어가서 답 안 함 — B단계 도입부에서 다시 짚어주기):
  > "PR #19 mutation 3개에 onSuccess가 없는 이유?"
  > 정답: 옵티미스틱이라 onMutate에서 이미 UI 반영. 응답 도착해도 추가 작업 없음. 실패 시 onError로 롤백만.

### 5단계 — useMutation B (옵티미스틱) ⏭️ **다음 시작점**

B단계에서 다룰 내용 (순서):

1. **옵티미스틱 3박자 개념**
   - onMutate: (a) 즉시 UI 반영 (b) 스냅샷 저장
   - 실제 fetch: 백그라운드
   - onError: 스냅샷으로 롤백 + 토스트
   - 비유: 식당 예약 — 손님에게 "잡혔어요" 먼저 말하고 뒤에서 시스템 확인. 안 잡혔으면 사과.

2. **queryClient API**
   - `getQueryData<T>(queryKey)` = 현재 캐시 스냅샷 읽기
   - `setQueryData<T>(queryKey, updater)` = 캐시 직접 갱신 (immutable updater 함수 패턴)
   - `invalidateQueries({ queryKey })` = stale 처리 후 자동 refetch (PR #19는 안 씀 — 옵티미스틱이라 불필요)

3. **PR #19 `markAsReadMutation` 라인별** (NotificationPage.tsx:55-79)
   - `mutationFn: markNotificationAsRead` — id를 통째로 받음 (단일 인자)
   - `onMutate(id)`:
     - `storeMarkAsRead(id)` — Zustand store도 같이 (unreadCount 동기화)
     - `getQueryData<PaginatedNotifications>(queryKey)` — 롤백용 백업
     - `setQueryData(queryKey, (old) => old ? { ...old, items: old.items.map(...) } : old)` — items 중 해당 id만 `read: true`
     - `return { previous }` — context로 onError에 전달
   - `onError(err, _id, context)`:
     - `context.previous`로 setQueryData 롤백
     - `console.error` + `toast.error`

4. **PR #19 `markAllAsReadMutation` 라인별** (81-107) — 위와 동일 패턴, 모든 items에 적용

5. **PR #19 `deleteMutation` 라인별** (109-127)
   - **핵심 차이**: mutationFn이 객체 인자 받음 `(vars: { id, wasUnread }) => deleteNotification(vars.id)`
   - 이유: store 갱신에 `wasUnread`가 필요한데 API는 id만 필요 → 객체로 묶어 전달
   - **인자가 여러 개일 때 객체로 묶는 전형적 패턴**
   - items 필터링으로 삭제 옵티미스틱

6. **53-54줄 코멘트 의미 (이중 갱신 + 비대칭 롤백)**
   - "옵티미스틱은 RQ 캐시(현재 페이지)와 store(unreadCount) **둘 다** 갱신"
   - "실패 시 캐시는 롤백되지만 store unreadCount는 다음 SSE/페이지 전환 시 **자연 보정**에 맡깁니다"
   - 왜? store unreadCount 롤백 = 추가 복잡도. SSE가 어차피 곧 정확한 값 push → 비대칭 트레이드오프.

### 6단계 (선택) — staleTime 30_000 / cacheTime ⏸ 미시작
B단계 끝나고 여유 있으면 5분 분량으로:
- staleTime = "fresh"로 간주되는 시간 (refetch 트리거 안 됨)
- gcTime(구 cacheTime, v5) = 메모리에서 제거되기까지 시간
- 30초 = 페이지네이션 왔다갔다 시 재요청 없음
- 둘의 차이 다이어그램

## 학습 진행 규칙 (사용자 피드백 반영)
- 비유 + 다이어그램 우선 (메모리: 이미지/구조 떠올라야 흡수 [[user-comprehension-criterion]])
- 한 단계 단위로 끊어가기 (메모리: 단계별 가이드 [[feedback-step-by-step-guidance]])
- 사용자 "다음" 신호 받기 전엔 다음 단계 안 들어가기
- 소크라테스식 확인 질문 1-2개로 단계 마무리 ([[feedback-learning-gap-socratic-checkin]])
- 길게 쏟지 말기 — 주의력 한계 ([[feedback-concise-when-tired]])
- 다음 후보 2-3개 제시 후 사용자 선택 (객관식 흐름)
- AI 50%+ 학습이므로 인지부채 HIGH 자각 ([[feedback-ai-written-code-cognitive-debt]])

## 학습 끝난 후 액션
- PR #19 머지 (사용자가 학습 완료 신호 주면 진행 확인)
- 머지 후 SSE HIGH 3 결정 세션 [[project-notification-high3-sse-library-pending]]
- 학습 자료는 블로그 글 후보 — RQ 마이그레이션 시리즈 [[project-blog-first-series]]
