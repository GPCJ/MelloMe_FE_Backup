---
name: P1 feed → pagination auto-fallback 구현 (인지부채 태그)
description: 2026-04-15 Claude가 직접 작성한 P1 fallback 구현의 모든 메커니즘 상세. 사용자 요청으로 인지부채 태그 — 코드는 동작하지만 사용자가 직접 작성하지 않았으므로 다음에 만지기 전 반드시 이 메모를 읽고 멘탈 모델 복원할 것.
type: project
created: 2026-04-15
status: implemented (검증 미완)
cognitive_debt: HIGH
originSessionId: 3599b53a-b50a-42ce-a92e-91432d0449b0
---
# P1 fallback 구현 상세 (인지부채 HIGH)

## ⚠️ 인지부채 태그 — 읽기 전 주의
- 이 코드는 **Claude가 작성**했음. 사용자가 한 줄도 직접 타이핑하지 않음.
- "AI 의존 줄이기" 정책(`user_self_coding_goal.md`)에 위배되는 부분이지만, 단순 implementation이라 사용자 결정으로 1번(직접 구현)을 선택.
- **다음에 이 코드를 만지거나 유사한 패턴을 다른 페이지에 적용할 때, 이 메모를 먼저 읽고 멘탈 모델을 복원할 것.**
- 학습 우선순위: 메커니즘 1, 2, 4 (왜 sticky-per-mount인지, onErrorRef 패턴, 한 mount 1회 시도 보장 메커니즘)

## 무엇을 했나 (3파일 변경)

### 1. `frontend/src/hooks/useInfiniteFeed.ts`
- `UseInfiniteFeedOptions`에 `onError?: () => void` 추가
- `onErrorRef = useRef(options.onError)` + 매 렌더마다 `onErrorRef.current = options.onError`
- catch 블록 안, `setError(...)` 직후 `onErrorRef.current?.()` 호출

### 2. `frontend/src/pages/post/PostListPage.tsx`
- `const [feedFailed, setFeedFailed] = useState(false)` 추가
- `isInfiniteMode = !therapyArea && activeTab === 'all' && !feedFailed` (기존 변수에 `!feedFailed` 추가)
- `useInfiniteFeed({ ..., onError: () => setFeedFailed(true) })`
- pagination 분기 내부 상단에 회색 안내 텍스트 한 줄 (조건: `feedFailed`)

### 3. `frontend/src/mocks/handlers/posts.handlers.ts`
- `/posts/feed` 핸들러 최상단에 `const FORCE_FEED_500 = false; if (FORCE_FEED_500) return new HttpResponse(null, { status: 500 });`
- 검증 토글. 사용자가 수동 검증 시 true로 바꾸면 모든 feed 요청이 500.

## 핵심 메커니즘 5개 (이해 못 하면 이 코드 만지지 말 것)

### 메커니즘 1: 왜 sticky-per-mount인가
**문제**: P0 버그(`project_filter_chip_feed_dup_bug.md`, d776f85)에서 `isInfiniteMode`가 false→true로 flip되면서 `useInfiniteFeed`가 재활성화되어 중복 요청/race가 발생함. drift가 진범이었지만 메커니즘 자체가 위험.

**해결**: `feedFailed`는 한 mount 내에서 false→true 단방향. true가 되면 어떤 사용자 액션(필터 칩, 탭 토글, URL 변경)으로도 false로 돌아가지 않음. → `useInfinite`도 false에서 영원히 안 돌아옴 → `useInfiniteFeed`의 `enabled`도 영원히 false → 같은 mount에서 feed 재요청 0회 보장.

**해제 경로**: 새로고침/페이지 이동 후 재진입 = unmount/remount = `useState(false)` 초기값으로 리셋. 이게 유일한 해제 경로.

**주의**: 코드베이스 어디에도 `setFeedFailed(false)`가 등장하면 안 됨. grep으로 확인.

### 메커니즘 2: onErrorRef 패턴 (왜 useRef로 감싸나)
**나이브 코드**:
```ts
// useInfiniteFeed.ts
fetchPage = useCallback(async () => {
  try { ... } catch {
    options.onError?.();  // ← deps에 options.onError 필요
  }
}, [size, options.onError]);
```

**문제**: `options.onError`는 PostListPage에서 매 렌더마다 새 함수 객체 (`onError: () => setFeedFailed(true)`). useCallback deps에 넣으면 fetchPage가 매 렌더마다 새로 생성됨 → 이걸 deps로 쓰는 effect들이 매 렌더 재실행됨 → useInfiniteFeed의 fetch effect가 매 렌더 abort+재시작 → 이전 04-14 race 패턴과 정확히 동일.

**해결**: `onErrorRef.current = options.onError`를 매 렌더 동기화. fetchPage는 ref만 읽으므로 deps에서 빠짐. callback의 latest 참조는 보장되면서 fetchPage stability는 유지.

**참고**: React 공식이 권장하는 "Latest ref 패턴". 04-14 race 메모(`project_infinite_feed_race_fix.md`)에서 학습한 requestIdRef 패턴과 같은 부류.

### 메커니즘 3: 왜 콜백 vs effect-watch에서 콜백을 골랐나
**대안**: 부모가 `useEffect(() => { if (infinite.error) setFeedFailed(true) }, [infinite.error])`.

**왜 안 좋은가**: render → commit → effect 실행은 한 프레임 지연. 그 지연 사이에 다른 effect(예: validation effect)가 `enabled`를 재평가할 가능성. P0의 메커니즘이 정확히 이런 "한 틱 지연 사이에 enabled가 재평가됨" 류였음.

**콜백은**: hook 내부 catch 블록 안에서 즉시 동기 호출. setFeedFailed(true)가 다음 렌더 사이클에 곧장 반영되며, 그 사이 다른 effect가 끼어들 frame이 없음.

### 메커니즘 4: 한 mount 1회 시도 보장 검증 (코드 경로 추적)
시나리오: feed 진입 → 500 → fallback.

1. mount → `feedFailed=false` → `useInfinite=true` → useInfiniteFeed enabled=true
2. enabled effect: `if (!enabled) return; if (itemsLengthRef.current > 0) return; fetchPage(null, true)` → 1회 호출
3. fetchPage catch → `setError(...)` → `onErrorRef.current?.()` → `setFeedFailed(true)`
4. setError + setFeedFailed 두 set state는 React batching → 한 번의 리렌더
5. 리렌더: `feedFailed=true` → `useInfinite=false` → enabled=false
6. enabled effect 재실행: `[enabled, fetchPage]` deps → enabled 변경됨 → effect 재실행 → `if (!enabled) return` → 곧장 종료. 단, cleanup으로 `inflightRef.current?.abort()` 실행 (이미 끝난 요청이라 무의미).
7. 이후 어떤 사용자 액션도 `useInfinite`를 true로 만들 수 없음 → fetchPage 호출 경로 없음.

**잠재적 위험점**: `loadMore`. 초기 fetch가 실패하면 sentinel observer는 isInfiniteMode=false로 분기에서 사라지므로 IntersectionObserver 자체가 disconnect됨 (sentinelRef effect의 cleanup). 따라서 loadMore도 호출 안 됨. ✓

### 메커니즘 5: 403 / 401과의 호환
- **401**: axios 인터셉터가 RT로 재요청 → 성공하면 onError 발화 안 함 → fallback 안 됨. 정상.
- **403** (공개 게시물 없음): catch 도달 → setError + setFeedFailed → 다음 렌더에서 pagination 분기로 진입 → pagination도 403 받으면 기존 분기(`error === '공개 게시물이 없습니다.'`)로 처리. **이중 처리**가 되지만 결과적으로 "공개 게시물이 없습니다" 메시지가 표시됨 + fallback 안내 메시지도 함께 표시됨. UX상 약간 시끄럽지만 잘못된 동작은 아님. 검증 시나리오에서 확인하고 거슬리면 `feedFailed && error !== '공개 게시물이 없습니다.'`로 안내 숨기기 가능.

## 검증 (미완 — 사용자가 수동으로 해야 함)
스펙 파일: `.omc/specs/deep-interview-feed-pagination-fallback.md` 8개 시나리오.

1. `posts.handlers.ts`의 `FORCE_FEED_500 = true`로 변경
2. `npm run dev` (또는 이미 켜져있으면 HMR로 반영)
3. 시나리오 1~6 + 추가 2개 수동 확인
4. 통과 후 `FORCE_FEED_500 = false`로 되돌리기
5. 백엔드 실제 200 환경에서도 회귀 없는지 한 번 더 확인

**아직 안 한 검증**: 브라우저 수동 실행. 사용자가 직접 돌릴 것.

## 회귀 위험 5가지 (코드 만질 때 체크)
1. **setFeedFailed(false) 등장 금지**. grep으로 늘 확인.
2. **`useInfinite` 변수명 변경 시 모든 분기/effect deps 일관 변경**. 현재 `isInfiniteMode`로 남아있음.
3. **다른 effect가 `feedFailed`를 deps에서 빼면 안 됨** (현재는 자동 — `isInfiniteMode` 통해 간접 의존).
4. **useInfiniteFeed에 새 콜백 prop 추가 시 동일하게 ref 패턴 사용**. options 직접 사용 금지.
5. **MSW `FORCE_FEED_500`은 검증용 임시 가드**. PR 전 false 확인.

## 트레이드오프 / 보류
- **fallback 후 인라인 메시지 문구**는 디자이너 미확인. "최신 피드를 불러오지 못해 페이지 모드로 전환했어요"는 가벼운 default. 디자이너 확인 시 변경.
- **403 이중 메시지**는 위 메커니즘 5 참조. 검증 후 결정.
- **`feedFailed`를 sessionStorage에 persist**하면 새로고침에서도 살아남는데, 스펙 결정 #2(sticky 아님, 매 mount 재시도)에 의해 일부러 안 함. 새로고침 = 재시도 기회.

## 관련 메모리
- `project_p1_feed_pagination_fallback_design.md` — 7개 결정사항 (사전 인터뷰)
- `project_filter_chip_feed_dup_bug.md` — P0 drift 버그 해결 과정
- `project_infinite_feed_race_fix.md` — 04-14 race + requestIdRef 패턴 학습
- `project_infinite_feed_learning_0414.md` — E 패턴 멘탈 모델
- `.omc/specs/deep-interview-feed-pagination-fallback.md` — 구현 스펙 (검증 시나리오 포함)
- `user_self_coding_goal.md` — AI 의존 줄이기 정책 (이 작업은 예외)
