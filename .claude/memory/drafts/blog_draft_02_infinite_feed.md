# [1부] 무한 스크롤 직접 구현기 — Velog 초안

> **작성 방식**: 섹션별 핵심 요지/힌트만 스켈레톤. **본문은 직접 작성**.
> **분량 목표**: 1,500~2,500자 (읽기 약 8~12분)
> **톤**: 1인칭, 과장 금지, 코드는 실제 프로젝트 그대로

---

## 메타 정보 (Velog 발행 시)

- **시리즈명**: `무한 스크롤 직접 구현기` (또는 `React Query를 선택하기까지`)
- **태그 후보**: `React` `TypeScript` `StrictMode` `AbortController` `무한스크롤` `race-condition` `TIL`
- **썸네일**: (선택) 스켈레톤 로딩 스크린샷 or 번호표 다이어그램

---

## 제목 후보 (하나 고르기 — SEO 키워드 포함 유리)

1. `React StrictMode에서 무한 스크롤이 영영 로딩 중인 이유`
2. `무한 스크롤 race condition을 "번호표"로 해결하기`
3. `AbortController만으론 부족했다 — 비동기 race 수동 해결기`
4. (직접 짓기)

---

## 섹션 구조

### 0. 도입 (3~4줄)

**핵심 요지**
- 개발 중 만난 이상한 버그 한 줄 요약
- 이 글에서 다룰 것 1줄
- 누구에게 유용한지 1줄 (React + 비동기 + StrictMode 겪는 모든 프론트 개발자)

**힌트**: 첫 문장은 상황 묘사로. 예) "`/posts` 페이지가 스켈레톤만 띄우고 영원히 멈춰있었다."

---

### 1. 증상

**핵심 요지**
- `infinite.isLoading` 영구 `true` 상태
- 새 요청도 안 나감 (네트워크 탭 비어있음)
- dev에서만 재현 (prod에서는 안 보임) ← 이게 단서

**힌트**: 가능하면 GIF나 스크린샷 1장. 없으면 텍스트 묘사만으로도 OK.

---

### 2. 첫 가설과 오답 (선택 — 넣으면 신뢰감↑)

**핵심 요지**
- "abort 처리를 제대로 안 했나?" → 점검해보니 `AbortController.abort()`는 잘 호출되고 있었음
- "그럼 왜 멈춰있지?" → 범인은 **StrictMode의 더블 마운트**

**힌트**: 오답을 솔직히 넣으면 독자가 과정을 따라오기 쉬움. "처음엔 여기서 막혔다" 같은 문장.

---

### 3. 근본 원인 — 3단 콤보

**핵심 요지**
- 재료 3개가 조합되어 터짐:
  1. `hasInitializedRef` 가드 — "이미 fetch 시작했으면 다시 안 함"
  2. React StrictMode 더블 마운트 (dev only)
  3. `signal.aborted` 기반 finally 가드 — abort된 요청은 `setIsLoading(false)` 스킵

**시나리오 타임라인 (그대로 복붙 OK — 코드펜스로 감싸기)**

```
[t=0] 1차 mount
      hasInitializedRef: false → true
      fetch 시작, setIsLoading(true)

[t=1] cleanup: abort() 호출

[t=2] 2차 mount (StrictMode)
      hasInitializedRef: true → return (fetch 안 함!)  ← ❌

[t=3] 1차 finally 실행
      signal.aborted === true → setIsLoading(false) 스킵  ← ❌

결과: isLoading=true 영구, 새 요청 없음 → 무한 스켈레톤
```

**핵심 문장 후보**: "1차가 abort당하면서 책임을 놓쳤는데, 2차는 '이미 시작됨' 가드에 막혀 **태어나지도 못했다**. 아무도 로딩을 꺼줄 사람이 없어진 것."

---

### 4. 해결 — `requestIdRef` 번호표 패턴

**핵심 요지**
- 비유: **"대기 번호표 뽑고, 응답이 왔을 때 내 번호가 아직 최신인지 확인한다"**
- 추상화 3개 교체 (표로 정리하면 가독성↑):

| | 기존 (잘못된 추상화) | 새 패턴 |
|---|---|---|
| fetch 개시 판정 | "이미 **시작**했나?" | "데이터 **있나**?" |
| 응답 신뢰 판정 | "abort **신호** 떴나?" | "내가 **최신**인가?" |
| 로딩 클리어 판정 | abort면 스킵 | 최신이면 무조건 클리어 |

**코드 블록 (실제 프로젝트에서 발췌 — 꼭 포함)**

```ts
const requestIdRef = useRef(0);

const fetchPage = useCallback(async (cursor, isInitial) => {
  if (inflightRef.current) inflightRef.current.abort();
  const controller = new AbortController();
  inflightRef.current = controller;
  const myId = ++requestIdRef.current; // 이 호출의 번호표

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

**힌트**: 코드는 최소한으로 자르되 `myId = ++requestIdRef.current` + stale 체크 부분은 필수.

---

### 5. 왜 `items.length` 가드만으론 부족한가 (선택, but 추천)

**핵심 요지**
- `AbortController`는 만능이 아님 — axios가 **이미 응답 헤더를 받은 상태**면 abort가 늦거나 실패
- 시나리오: A 요청 → 필터 토글 → B 요청 → B 먼저 완료 → `setItems(B)` → A 뒤늦게 도착 → `setItems(A)`로 **B 덮어씀**
- `requestIdRef`는 전송계층과 무관하게 애플리케이션 레벨에서 판정 → **race-safe**

**힌트**: 이 섹션 있으면 글 깊이 ↑. 시간 없으면 한 문단으로 줄여도 OK.

---

### 6. 한계 인식 — 이게 2부로 가는 다리

**핵심 요지**
- `requestIdRef`, `inflightRef`, `itemsLengthRef`, `finally` 가드… **추적할 ref가 너무 많음**
- 캐싱, 백그라운드 리페칭, 요청 dedup은 **아직 손도 못 댐**
- "이거 훅 하나당 매번 이 수준의 설계 하기엔 지속 불가능하다" 체감

**힌트**: 솔직한 피로감을 그대로 써도 좋음. "직접 구현하면 이 정도 신경써야 하는데, 매번 이걸 반복할 수 있을까?" 식의 질문.

---

### 7. "그럼 처음부터 RQ 쓰지 그랬어?" (독자 예상 질문 선제 대응)

**핵심 요지** (솔직하게 쓰는 게 핵심)
- 구현 당시엔 RQ 문법/개념에 아직 익숙하지 않았음 → 후보로 머릿속에 떠오르지도 않았음
- 구현을 마치고 훅을 다시 읽어보는데 **복잡함이 눈에 들어옴** — "복잡" 한 단어로 끝내지 말고 **뭐가 복잡했는지** 구체 근거 붙이기:
  - `requestIdRef`, `inflightRef`, `itemsLengthRef`, `hasInitializedRef` — **ref 4개를 동시에 추적**
  - 응답 하나마다 stale 체크 / 로딩 책임 분리 / `ERR_CANCELED` 분기가 한 함수에 몰림
  - **다음에 유사한 훅 하나 더 만들 때 이 설계를 처음부터 다시 짤 자신이 없었음**
- 마침 수업에서 배운 React Query가 이 상황에 맞겠다는 확신이 왔음

**힌트**:
- 이 섹션이 **2부로 가는 다리 + 독자 신뢰 확보** 둘 다 담당. 독자가 "왜 처음부터 RQ 안 썼어?"라고 물을 타이밍을 선제적으로 끊는 역할.
- Q&A 형식으로 써도 좋음. 예: `> 그럼 처음부터 React Query 쓰면 됐던 거 아닌가요?` 인용구로 시작 → 답변.
- "몰라서 안 썼다"는 솔직함이 **허술함이 아니라 성장 서사**. 굳이 감추지 않기.

---

### 8. 다음 편 예고 (2~3줄)

**핵심 요지**
- 수업에서 배운 **React Query**가 이 문제에 잘 맞을 것 같아 마이그레이션 예정
- 실제로 TanStack Query 내부도 같은 request id 패턴을 사용함 → 방향 확신
- 2부: 마이그레이션 후기 + Before/After 비교 예정

**힌트**: 짧게. 과한 예고는 부담.

---

### 9. 교훈 (선택, 불릿 3개 내외)

- React StrictMode는 버그가 아니라 **잘못된 추상화를 드러내는 도구**
- "fetch 시작했나(상태 추적)" → "데이터 있나(결과 관찰)"로 판정하는 게 의미상 옳음
- 비동기 race에서 `AbortController`만으론 부족 — **애플리케이션 레벨 stale 체크 필요**

---

## 발행 전 체크리스트

- [ ] 제목 확정 (검색 키워드: `react strictmode`, `race condition`, `infinite scroll` 중 1개 이상 포함 권장)
- [ ] 코드 블록 언어 지정 (` ```ts `)
- [ ] 시리즈 설정 (Velog 우측 설정 → 시리즈에 추가)
- [ ] 태그 3~5개
- [ ] 썸네일 (선택)
- [ ] 미리보기에서 줄바꿈/표 렌더링 확인
- [ ] 발행 후 URL을 `project_blog_first_series.md` 체크리스트에 기록

---

## 작성 루틴 힌트

1. **순서대로 쓰려 하지 말기** — 쉬운 섹션부터 (보통 3~4번이 제일 술술 나옴)
2. **도입(0번)은 제일 마지막에** — 본문 다 쓰면 자연스러운 훅이 떠오름
3. **한 번에 완성 금지** — 초안 → 자고 일어나서 다시 읽기 → 다듬기
4. 막히면 wiki 원본(`useinfinitefeed-e-requestidref`, `useinfinitefeed-e-04-14`) 다시 펼치기
