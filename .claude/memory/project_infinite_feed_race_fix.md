---
name: useInfiniteFeed 무한 스켈레톤 버그 + E 패턴 수정
description: React StrictMode + abort-on-cleanup 조합으로 생긴 isLoading stuck 버그의 근본 원인과 requestId 기반 수정 원리 (복습용)
type: project
originSessionId: 53077e2e-4230-4368-bf84-245094e51663
---
## 증상

`feat/infinite-scroll` 브랜치, PostListPage에서 `/posts` 진입 시 스켈레톤 UI만 표시되고 실제 데이터가 영영 안 나타남. `infinite.isLoading`이 `true`로 영구 고정.

## 근본 원인

`useInfiniteFeed.ts`의 세 가지 요소가 조합되어 터진 버그:

1. **`hasInitializedRef` 가드** — "이미 fetch 시작했으면 다시 안 함"
2. **React StrictMode 더블 마운트** — dev에서 effect를 mount → cleanup → remount 순으로 두 번 실행
3. **abort-on-cleanup 패턴** — cleanup에서 `inflightRef.current?.abort()` 호출
4. **`signal.aborted` 기반 finally 가드** — abort된 요청의 finally는 `setIsLoading(false)` 스킵

### 시나리오

```
[t=0] 1차 mount
  useEffect: hasInitializedRef=false → true로 세팅
  fetchPage 시작, setIsLoading(true), 요청 발송

[t=1] cleanup
  controller.abort() 호출

[t=2] 2차 mount (StrictMode)
  useEffect: hasInitializedRef=true → return (fetch 안 함!)

[t=3] 1차의 finally 실행
  signal.aborted === true → setIsLoading(false) 스킵

→ 결과: isLoading=true 영구 고정, 새 요청도 없음, 스켈레톤 무한
```

## E 패턴 수정 (적용 완료, 미커밋)

세 가지 추상화를 전부 바꿈:

| | 기존 | E 패턴 |
|---|---|---|
| fetch 개시 판정 | "이미 시작했나?" (`hasInitializedRef`) | "데이터 있나?" (`itemsLengthRef`) |
| 응답 신뢰 판정 | "abort 신호 떴나?" (`signal.aborted`) | "내가 최신인가?" (`requestIdRef`) |
| 로딩 클리어 판정 | abort면 스킵 | 최신이면 무조건 클리어 |

### 핵심 장치 1: `requestIdRef` (단조증가 카운터)

```ts
const requestIdRef = useRef(0);

const fetchPage = useCallback(async (cursor, isInitial) => {
  if (inflightRef.current) inflightRef.current.abort();
  const controller = new AbortController();
  inflightRef.current = controller;
  const myId = ++requestIdRef.current; // 이 호출의 평생 박제 번호

  // ...
  try {
    const data = await fetchFeed({ ... });
    if (requestIdRef.current !== myId) return; // stale 체크
    setItems(...);
  } catch (err) {
    if (requestIdRef.current !== myId) return;
    if (isAxiosError(err) && err.code === 'ERR_CANCELED') return;
    setError(...);
  } finally {
    if (requestIdRef.current === myId) { // 최신이면 클리어
      if (isInitial) setIsLoading(false);
      else setIsFetchingMore(false);
    }
  }
}, [size]);
```

- 매 호출마다 `++requestIdRef.current`로 번호 증가, `myId`는 클로저에 박제
- 응답 시점에 `requestIdRef.current !== myId`면 "그 사이 더 새로운 요청이 있었다 = 나는 stale = 무시"
- finally 판정도 같은 기준 → abort여도 최신 요청이면 로딩 클리어, stale이면 스킵 (새 요청이 책임)

### 핵심 장치 2: `itemsLengthRef` (effect 무한 루프 방지)

```ts
const itemsLengthRef = useRef(items.length);
itemsLengthRef.current = items.length;

useEffect(() => {
  if (!enabled) return;
  if (itemsLengthRef.current > 0) return; // 데이터 있으면 fetch 안 함
  fetchPage(null, true);
  return () => { inflightRef.current?.abort(); };
}, [enabled, fetchPage]);
```

- `items.length`를 deps에 직접 넣으면 fetch → items 증가 → effect 재실행 → 무한 루프
- ref로 우회해서 effect 실행 시점의 값을 한 번 읽기만. deps는 `[enabled, fetchPage]`만

### StrictMode 재현 (수정 후)

```
[t=0] 1차 mount
  items.length === 0 → 통과
  fetchPage 호출, requestIdRef=1, myId(1)=1
  setIsLoading(true), 요청 시작

[t=1] cleanup: controller1.abort()

[t=2] 2차 mount
  items.length === 0 (아직 1차 응답 안 받음) → 통과
  fetchPage 호출, requestIdRef=2, myId(2)=2
  새 요청 시작

[t=3] 1차 catch (ERR_CANCELED)
  requestIdRef(=2) !== myId(=1) → return
  finally: requestIdRef(=2) === myId(=1)? NO → 스킵
  → 1차는 어떤 state도 안 건드림 ✅

[t=4] 2차 try 성공
  requestIdRef(=2) === myId(=2) → 통과
  setItems(20개) ✅
  finally: 일치 → setIsLoading(false) ✅
```

### D(items.length 가드만)로는 부족한 이유 — race condition

abort가 늦거나 안 되는 경우:

```
[t=0] A 시작 (myIdA=1), 응답 느림
[t=1] 필터 토글로 B 시작 (myIdB=2)
      A.abort() 호출됐지만 axios는 이미 응답 헤더 받음
[t=2] B 성공 → setItems(B) ✅
[t=3] A 뒤늦게 도착, signal.aborted가 false로 보일 수 있음
      → setItems(A) → B 덮어씀 💥
```

E 패턴은 `requestIdRef(=2) !== myIdA(=1)`로 전송계층과 무관하게 stale 판정 → race-safe.

## 핵심 한 줄

**"요청에 번호표를 붙여서, 응답이 돌아왔을 때 '아직 내가 최신 번호인가?'만 확인한다"**

나머지 디테일은 이 한 줄에 살을 붙인 것.

## 교훈

- React StrictMode는 버그가 아니라 **잘못된 추상화를 드러내는 도구**
- "fetch 시작했나"(상태 추적) 대신 "데이터 있나"(결과 관찰)로 판정하는 게 의미상 옳음
- TanStack Query, SWR 등 실무 라이브러리도 내부적으로 request id 패턴을 사용
- 비동기 race에서 `AbortController`만으론 부족 — 이미 받은 응답은 abort 못 막으니 애플리케이션 레벨 stale 체크 필요

## 복습 재시작 방법

다음 세션에서:
```
어제 useInfiniteFeed race condition 디버깅 설명 다시 보여줘
```
또는
```
project_infinite_feed_race_fix.md 읽고 E 패턴 원리 설명해줘
```
