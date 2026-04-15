---
name: 필터 칩 클릭 시 feed 중복 요청 버그 해결 과정 (인지부채)
description: PostListPage 필터 칩 → /posts 200 + /posts/feed 500 동시 발화 버그의 원인 추적과 해결. validation effect drift가 isInfiniteMode flip을 유발한 사례.
type: project
originSessionId: 8be68c68-52da-49e6-ac2c-736f354b0a8f
---
# P0: 필터 칩 클릭 시 feed 요청 중복 발화 버그 (2026-04-15 해결, 커밋 d776f85)

## 증상
- Vercel 프로덕션에서 `/posts` 진입 → 감각통합치료 칩 클릭 → 페이지네이션 `/posts` 200 성공 + `/posts/feed` 500 동시 발화
- 페이지네이션이 정상 렌더링됐는데도 무한 스크롤 요청이 한 번 더 나가서 500 에러를 받음
- 백엔드는 임시로 `/posts/feed`에 500 응답 중

## 진짜 원인 (한 줄)
**`PostListPage.tsx`의 `VALID_THERAPY_AREAS` 화이트리스트가 `FILTER_CHIPS`와 drift되어, 감각통합치료(`SENSORY_INTEGRATION`) 등 일부 값이 누락 → validation effect가 URL을 clear → `isInfiniteMode`가 false→true로 복귀 → `useInfiniteFeed`가 재활성화되어 fetchPage 재호출.**

## 발화 체인
1. 유저가 감각통합치료 칩 클릭 → `setSearchParams({ therapyArea: 'SENSORY_INTEGRATION' })`
2. `isInfiniteMode = false` → 페이지네이션 effect 발동 → `GET /posts?therapyArea=SENSORY_INTEGRATION` 200 ✓
3. validation effect (`PostListPage.tsx:94-99`) 발동: `!VALID_THERAPY_AREAS.includes('SENSORY_INTEGRATION')` → true → `setSearchParams({})` 호출
4. URL이 `therapyArea=''`로 리셋 → `isInfiniteMode = true`로 복귀
5. `useInfiniteFeed` mount effect 재실행 (deps `[enabled, fetchPage]` 중 enabled가 false→true): `enabled=true`, `itemsLen=0` → `fetchPage(null, true)` 호출 → `GET /posts/feed` 500

## 해결 (커밋 d776f85)
```ts
// Before
const VALID_THERAPY_AREAS: (TherapyArea | '')[] = [
  '', 'OCCUPATIONAL', 'SPEECH', 'PLAY', 'COGNITIVE', 'UNSPECIFIED',
];

// After
const VALID_THERAPY_AREAS: (TherapyArea | '')[] = FILTER_CHIPS.map(
  (chip) => chip.value,
);
```
단일 소스(`FILTER_CHIPS`)에서 파생 → drift 구조적 차단.

## 디버깅 과정에서 헛다리 짚었던 가설들 (인지부채)

### 가설 1: 초기 mount 잔재 ❌
"`/posts` 진입 시점에 이미 feed 500이 한 번 났고, 유저가 Network 탭에서 그걸 필터 클릭 시점과 혼동한 것 아닌가?" → 유저가 정확히 "필터 클릭 후 새로 발화한다"고 확인 → 기각.

### 가설 2: 필터 해제(deselect) 경로 ❌
"필터를 다시 빈 값으로 해제할 때 `enabled: false→true` 전환 + `itemsLen=0` 가드 통과로 fetchPage 재발화" → 유저가 "필터를 누르는 행위 자체에서 발생"이라고 확정 → 기각. (단, 메커니즘은 비슷했음 — 결국 enabled flip이 진범이긴 했음)

### 가설 3: IntersectionObserver race ❌
"필터 클릭 직후 sentinel disconnect 전에 observer 콜백이 큐잉되어 loadMore가 stale closure로 발화" → loadMore 가드 (`error || isLoading`)가 closure 시점과 무관하게 통과되는 시나리오 가정 → 로그 결과 loadMore는 항상 가드에서 early return → 기각.

### 가설 4: Service Worker 잔재 (MSW production 잔재) ❌
"프로덕션에 MSW worker가 등록된 채로 남아 있어서 간섭" → DevTools Application 탭 확인 결과 SW 없음 → 기각.

### 가설 5: DB 데이터 유무가 변수 ❌ (우연의 상관관계)
유저가 "DB에 게시물 있으면 버그, 없으면 정상"이라고 보고. 하지만 진짜 변수는 "유저가 누른 칩이 `VALID_THERAPY_AREAS`에 포함된 값인지". 테스트 시 우연히 게시물 있는 카테고리는 누락된 칩(SENSORY_INTEGRATION)이었고, 게시물 없는 카테고리는 포함된 칩이었음. **DB는 무관.**

## 결정적 단서
디버그 로그 추가 후 발견: 필터 클릭 시 `[feed-effect]`가 두 번 찍힘.
1. 첫 번째: `{enabled: false, itemsLen: 0}` ← 정상, early return
2. 두 번째: `{enabled: true, itemsLen: 0}` ← **enabled가 true로 복귀!**

`enabled = isInfiniteMode = !therapyArea && activeTab === 'all'`이 다시 true가 되려면 `therapyArea`가 빈 값으로 돌아가야 함 → 누가 URL을 clear했는가? → validation effect 의심 → `VALID_THERAPY_AREAS` 확인 → drift 확정.

## 학습/교훈

### 1. 화이트리스트 drift는 침묵의 버그
타입 정의(`TherapyArea`)와 UI 목록(`FILTER_CHIPS`)과 검증 목록(`VALID_THERAPY_AREAS`)이 별개로 존재하면 drift 필연. **단일 소스에서 파생**해야 함. 비슷한 패턴이 다른 곳에도 있는지 점검 필요(예: 다른 enum 화이트리스트들).

### 2. validation effect는 부수효과의 부수효과를 만든다
"이상한 URL 파라미터를 청소하는" 방어 코드가 다른 derived state(`isInfiniteMode`)를 flip시키고, 그게 또 다른 effect(`useInfiniteFeed`)를 재실행시키는 연쇄. 방어 코드일수록 부작용이 광범위해질 수 있음. 가능하면 타입 시스템으로 막거나, 영향 범위를 제한하는 게 좋음.

### 3. "재현 조건의 상관관계 ≠ 인과관계"
유저가 보고한 "DB 데이터 유무가 변수"는 우연이었음. 보고된 상관관계를 그대로 가설로 받지 말고, **메커니즘이 설명 가능한지** 검증해야 함. 메커니즘 없는 상관관계는 confounding variable 가능성 의심.

### 4. console.trace보다 console.log + 상태값 출력이 더 유용했다
스택 트레이스만으로는 React fiber work의 minified 함수명이 의미 불명. **각 effect/콜백 진입부에 상태값을 찍는 게** "어느 시점에 어느 값으로 호출됐는지" 추적에 훨씬 효과적. 특히 effect 재실행 추적은 deps 값을 직접 찍어야 함.

### 5. 정적 분석이 막히면 빠르게 동적 추적으로 전환
3~4번 추론으로 답 안 나오면 코드만 더 읽지 말고 즉시 로그 추가 → 재현 → 데이터 기반으로 좁히기. 이 케이스에서 정적 분석으로 4시간 헤맸지만 로그 한 번 찍은 후 30분 안에 확정.

## 관련 파일
- `frontend/src/pages/post/PostListPage.tsx` (validation effect, VALID_THERAPY_AREAS)
- `frontend/src/constants/post.ts` (FILTER_CHIPS, TherapyArea 라벨)
- `frontend/src/types/post.ts` (TherapyArea 타입 정의)
- `frontend/src/hooks/useInfiniteFeed.ts` (mount effect, fetchPage)

## 남은 엣지 케이스 (P1에서 자연 해소 예정)
유저가 주소창에 `/posts?therapyArea=GARBAGE` 직접 입력하는 경우, validation effect가 여전히 URL을 clear하고 같은 메커니즘으로 feed 재요청이 발생함. P1 리팩토링("feed 실패 → pagination auto-fallback") 시 "isInfiniteMode flip으로 feed 재요청하지 않기" 원칙이 적용되면 자연 해소.
