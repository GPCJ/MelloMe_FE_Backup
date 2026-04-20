---
name: useInfiniteFeed E패턴 학습 다이제스트 (04-14)
description: 블록 1~3 학습 내용 요약 + 블록 4 일부. 다음 세션에서 React Query 적용 전 리마인드용
type: project
originSessionId: 9192a2a7-64ca-4e7a-a6b3-2fb7db5ff8b2
---
## 학습 목표 (달성 여부)
- [x] E 패턴 핵심 감각 잡기 (블록 1~3)
- [ ] 블록 4~7 세부 이해 — **의도적으로 생략**. React Query로 갈아엎을 예정이라 overkill 판단
- [ ] React Query 적용 (다음 세션)

## 확정된 멘탈 모델 (블록 1~3)

### 1. State 분리 기준 = UI 렌더 모드
- `isLoading`(전체 대체, 첫 로드 스켈레톤 4개) vs `isFetchingMore`(뒤에 추가, 스켈레톤 2개)
- PostListPage 렌더가 증거: `isLoading ? 스켈레톤 : 리스트` / 리스트 뒤에 `isFetchingMore && 스켈레톤`
- 합쳤다면 loadMore 시 기존 리스트가 순간 사라지는 UX 파탄

### 2. Ref 선택 기준 = "리렌더에 관여할 필요 없는 내부 장부"
- 변수: 렌더마다 초기화 ❌
- state: 불필요한 리렌더 유발 ❌
- useRef: 렌더 간 유지 + 리렌더 트리거 없음 ✅

### 3. 두 장치의 짝 구조
- **inflightRef (AbortController)** = 네트워크 레벨 취소. 진행 중인 다운로드 끊고 리소스 절약
- **requestIdRef (단조증가 카운터)** = 애플리케이션 레벨 stale 차단
- **핵심**: abort는 "진행 중인 네트워크"만 막음. 이미 다운로드 끝난 응답의 `.then`은 정상 실행됨 → requestIdRef가 한 번 더 거른다
- 두 장치는 **서로 다른 사각지대를 덮는 짝**

### 4. fetchPage 진입부 순서
```ts
if (inflightRef.current) inflightRef.current.abort();  // 옛 controller 정리
const controller = new AbortController();               // 새 controller
inflightRef.current = controller;                       // ref에 저장
const myId = ++requestIdRef.current;                    // 번호표 (전위 증가)
```
- `inflightRef.current`는 **시점에 따라 가리키는 대상이 다름** (직전 호출의 유산 vs 지금 막 만든 것)
- 순서 뒤집으면 새 controller가 자기 자신을 abort하는 파탄
- 전위 `++`는 성능이 아니라 **값 의미** (증가 후 값 반환). 후위면 myId가 이전 번호 받아서 stale 체크 전부 깨짐

## 블록 4에서 건진 것 (일부)
### updater 함수 (`prev => ...`)를 쓰는 이유
- `fetchPage`는 `useCallback([size])`로 박제됨 → 같은 함수 인스턴스 재사용
- 함수 본문 안 `items`는 **클로저에 박제된 낡은 값**
- `setItems(prev => [...prev, ...])`로 쓰면 React가 "지금 진짜 최신값"을 prev로 넘겨줌
- **슬로건: "내가 기억하는 값 ≠ 지금 진짜 값. prev로 React에게 물어보자"**

## 생략한 블록 (4 나머지 ~ 7)
- try/catch/finally 세부 가드 로직
- `itemsLengthRef`로 effect 무한루프 방지하는 메커니즘
- `isInitial=true` 사용 시나리오
- **이유**: React Query가 이 모든 관심사를 대신 처리. 라이브러리 치환 관점에선 "복잡한 게 많았다"는 감각만 있으면 충분

## React Query 적용 시 "설명할 수 있어야 할 3가지"
1. **이 훅이 해결하려는 문제는?**
   → 비동기 요청의 race/중복/stale 응답 처리 + 커서 페이지네이션 상태 관리
2. **기존 코드가 쓴 장치는?** (이름만 나열 가능하면 OK)
   → inflightRef, requestIdRef, itemsLengthRef, isLoading/isFetchingMore 분리, updater 함수
3. **React Query는 이 중 뭘 대신 해주나?**
   → 전부. `useInfiniteQuery` + `queryKey`/`queryFn`/`getNextPageParam`만 쓰면 위 장치가 내부 처리됨

## 다음 세션 진행 순서
1. 이 파일 읽고 5분 리마인드
2. `useInfiniteQuery`로 `useInfiniteFeed` 치환
3. 브랜치 전략 결정 (feat/infinite-scroll 유지 vs 새 브랜치)
4. 치환 전/후 비교로 "뭐가 줄었는지" 설명 작문
