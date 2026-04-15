---
name: P1 feed → pagination auto-fallback 새 설계 결정사항
description: PostListPage 무한 스크롤 → pagination fallback 리팩토링의 7가지 설계 결정. 다음 세션에서 바로 구현 진입 가능하도록 사전 인터뷰 결과 보존.
type: project
originSessionId: 8be68c68-52da-49e6-ac2c-736f354b0a8f
---
# P1: feed 실패 → pagination auto-fallback 리팩토링 설계 (2026-04-15 결정, 미구현)

## 배경
P0 클로즈 후속 작업. 현재 분기는 `isInfiniteMode = !therapyArea && activeTab === 'all'` 기반(필터 유무로 결정). 백엔드 `/posts/feed`가 임시로 500 응답 중이라 무한 스크롤 자체가 무력화. 새 설계는 "**진입 시 무한 스크롤 시도 → 실패하면 pagination으로 자동 fallback**"으로 변경.

## 사전 인터뷰 결정사항 (7개)

### 1. 필터 칩 동작
**현재 동작 유지**: 필터 칩 선택 시 무조건 페이지네이션 사용. 백엔드가 `/posts/feed` 엔드포인트에 `therapyArea` 파라미터를 추가해주면 그 시점부터 필터 칩 선택에도 무한 스크롤로 전환.
- 백엔드 스펙 변경 대기 항목으로 `project_backend_priority_list.md` 또는 동급 메모리에 추가 필요.

### 2. fallback 지속성
**Sticky 아님, 매 mount마다 재시도.**
- 진입 → 무한 스크롤 시도 → 실패 → pagination 사용
- 새로고침 / 다른 페이지 갔다가 복귀 → 다시 무한 스크롤 시도 → 실패 → pagination
- 세션 내 캐시/플래그 X.

### 3. fallback 트리거 에러 범위
**렌더 실패하는 모든 에러 = fallback.**
- 4xx, 5xx 모두 포함
- 네트워크 에러, 타임아웃 포함
- 401(인증)은 axios 인터셉터가 처리 후 재요청하므로 자연스럽게 통과
- 403(공개 게시물 없음)은 기존 pagination 경로의 특수 처리(`project_403_public_post_tradeoff`)와 호환 필요

### 4. 로딩 UX
**feed 실패 시 에러 메시지 잠깐 노출 후 pagination 시도** (option b 채택).
- 완전 무음 교체(option a) 대신 유저가 "fallback 발생함"을 인지할 수 있는 정도의 짧은 표시.
- 구체적 표시 방식(토스트 vs 인라인 vs 스피너만)은 구현 시 디자이너 확인 또는 가벼운 인라인 텍스트로 시작.

### 5. 디버깅 우선순위
**범인 먼저 특정 → 리팩토링** (option b 채택).
- 이미 P0에서 완료. drift가 진범이었음. 이 결정 덕분에 새 설계에서도 같은 메커니즘을 다시 만드는 것을 피할 수 있음.

### 6. fallback 로직의 영구성
**MVP ~ 백엔드 복구 또는 pagination 엔드포인트 삭제 전까지 유지.**
- 임시 가드가 아니라 일정 기간 영구 장치로 설계
- "무한 스크롤이 안정화되면 제거"가 아니라 "백엔드가 pagination 엔드포인트를 없앨 때 제거"

### 7. 적용 범위
**`/posts`에만 적용. 다른 페이지는 보류.**
- `SearchPage`, `ProfilePage`의 내 글 목록 등은 비슷한 패턴이 있어도 일단 손대지 않음
- 다른 페이지에서 비슷한 문제 발생 시 그 때 별도 적용

## 새 분기 로직 스케치

```ts
// PostListPage 내부 (개념 코드, 실제 구현 시 다듬을 것)
const [feedFailed, setFeedFailed] = useState(false); // mount 단위, persist X

// 모드 결정: 필터 있으면 무조건 pagination, 없고 feed 미실패면 무한 스크롤
const useInfinite = !therapyArea && activeTab === 'all' && !feedFailed;

const infinite = useInfiniteFeed({
  enabled: useInfinite,
  onError: () => setFeedFailed(true), // feed 실패 시 fallback 신호
});

// pagination fetch는 (필터 있음) OR (feed 실패) 조건에서 발동
useEffect(() => {
  if (useInfinite) return;
  // ... fetchPosts
}, [therapyArea, currentPage, activeTab, useInfinite]);
```

## 구현 시 주의사항

### 메커니즘 재발 방지
P0 버그의 본질은 "isInfiniteMode가 false→true로 flip되면서 useInfiniteFeed가 재활성화"였음. 새 설계에서 같은 메커니즘이 살아남으면 안 됨.
- **원칙**: 한 mount 내에서 무한 스크롤 시도는 **최대 1회**. 실패 후에는 같은 mount 내에서 다시 시도하지 않음.
- `feedFailed` state가 reset되는 경로가 없도록 주의 (오직 unmount/remount 시에만 초기화).
- validation effect가 URL을 clear할 때도 `feedFailed`가 살아있으면 useInfinite는 여전히 false.

### useInfiniteFeed 시그니처 변경
현재 `useInfiniteFeed`는 에러를 자체 state로만 관리. 부모에게 fallback 트리거를 알리려면 콜백 또는 외부 관찰 수단 필요.
- 옵션 A: `onError` 콜백 prop 추가
- 옵션 B: 부모가 `infinite.error`를 useEffect로 watch
- 옵션 C: useInfiniteFeed가 fallback 신호 자체를 외부로 노출

선택은 구현 단계에서 결정.

### P0의 엣지 케이스 자동 해소
`/posts?therapyArea=GARBAGE` 같은 URL 오염 시나리오에서, validation effect가 URL을 clear해도 `feedFailed`가 true면 무한 스크롤로 복귀하지 않음 → 자연 해소. 단 첫 시도(mount)에서 feed가 정상이면 무한 스크롤로 들어감(이건 정상 동작).

### 검증 시나리오
1. `/posts` 진입 + feed 200 정상 → 무한 스크롤 표시
2. `/posts` 진입 + feed 500 → 에러 메시지 잠깐 → pagination으로 전환 → 게시글 표시
3. `/posts?therapyArea=SPEECH` 진입 → pagination 바로 사용 (feed 시도 없음)
4. `/posts` 진입 후 feed 정상 → 필터 칩 클릭 → pagination
5. `/posts` 진입 후 feed 500 → fallback → 새로고침 → 다시 feed 시도 (sticky X 검증)
6. `/posts?therapyArea=GARBAGE` 진입 → URL 정리 + pagination 사용 (feed 재요청 없음 검증)

## 다음 세션 진입 시 액션
1. 이 메모리 + `project_filter_chip_feed_dup_bug.md` 둘 다 읽기
2. P0 커밋(`d776f85`) 이후 코드 상태 확인 (`PostListPage.tsx`, `useInfiniteFeed.ts`)
3. 위 7개 결정사항 + "메커니즘 재발 방지" 원칙 그대로 적용
4. 별도 PR/커밋으로 분리 (P0와 섞지 않기)
5. 구현 후 위 6개 검증 시나리오 모두 통과 확인

## 관련 메모리
- `project_filter_chip_feed_dup_bug.md` — P0 버그 해결 과정 (선행 작업)
- `project_infinite_scroll_progress.md` — 무한 스크롤 메인 머지 상태
- `project_infinite_scroll_roadmap.md` — 3단계 로드맵
- `project_403_public_post_tradeoff.md` — 403 처리 특수 케이스
