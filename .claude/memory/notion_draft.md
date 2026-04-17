# 노션 업데이트 초안 (2026-04-15) — 포트폴리오용 기능 정리

**대상 페이지:** 멜로미 프론트엔드 개발 진행 상황
**URL:** https://www.notion.so/322c8200749b81a2a188dd0082b6b15a

(이력서/포트폴리오/면접 답변에 그대로 인용할 수 있도록 STAR 형식으로 정리)

---

## 기능 1. 메인 피드 무한 스크롤

### 한 줄 요약
페이지네이션 버튼 방식의 메인 피드를 커서 기반 무한 스크롤로 전환하여 탐색 흐름을 끊김 없이 개선

### Situation
- 멜로미 메인 피드는 "다음 페이지" 버튼 기반 페이지네이션이었음
- 모바일 사용자 비중이 높은 커뮤니티 특성상, 버튼 클릭 → 상단 점프 → 새 목록 로딩 흐름이 탐색 피로도를 키움
- 백엔드가 별도 커서 기반 엔드포인트(`GET /api/v1/posts/feed`)를 제공하기 시작

### Task
- 기존 페이지네이션은 유지하되, 기본 전체 피드에만 무한 스크롤을 적용
- 게시글 상세 진입 후 뒤로가기 시 스크롤 위치 복원
- StrictMode·중복 요청·취소(race condition) 케이스 안전성 확보

### Action
- IntersectionObserver + 커스텀 훅 `useInfiniteFeed` 직접 구현
  - `AbortController`로 진행 중 요청 취소
  - `requestIdRef`로 늦게 도착한 응답을 무시하는 "요청 ID 가드 패턴" 적용
- 스크롤 복원: Zustand 스토어에 `(scrollY, snapshot, TTL 5분)` 저장, 1회 소비 후 폐기 (`feedScrollStore`)
- 모드 분기: `isInfiniteMode = !therapyArea && activeTab === 'all'` — 필터/팔로잉 탭은 기존 페이지네이션 유지
- API 응답 envelope(`{success, data: {items, nextCursor, hasNext}}`) 언래핑을 한 곳에서 처리해 호출부 간소화
- MSW에 커서 기반 mock 추가하여 백엔드 준비 전부터 동일 인터페이스로 개발

### Result
- 04-14 main 머지·배포 완료, 백엔드 실서버 `/posts/feed` 연동 검증 완료
- 모바일 탐색 흐름이 끊김 없이 이어지고, 상세에서 돌아와도 보던 위치가 유지됨
- 다음 단계로 React Query `useInfiniteQuery` 마이그레이션을 계획 중 (직접 구현으로 race/취소 패턴을 학습한 뒤 라이브러리로 이관)

### 면접 예상 질문 & 답변 포인트
- **Q. 왜 React Query를 처음부터 쓰지 않았나요?**
  - A. 라이브러리에 의존하기 전에 race condition·요청 취소·StrictMode 더블마운트의 동작 원리를 직접 다뤄보고 싶었습니다. 직접 구현해본 경험이 있으니, 추후 React Query로 옮길 때도 어떤 문제를 추상화해주는지 명확히 이해한 채로 사용할 수 있습니다.
- **Q. race condition은 어떻게 처리했나요?**
  - A. 두 가지를 같이 썼습니다. (1) `AbortController`로 진행 중 fetch를 취소, (2) `requestIdRef`로 응답에 요청 ID를 매겨, 가장 마지막 요청 ID와 일치하지 않으면 결과를 버립니다. abort만으로는 StrictMode 더블마운트나 마이크로태스크 타이밍에서 새는 응답이 있어서 ID 가드를 추가했습니다.
- **Q. 스크롤 복원은 어떻게 구현했나요?**
  - A. 라우팅 시점에 Zustand 스토어에 scrollY와 목록 스냅샷을 TTL 5분으로 저장하고, 피드로 복귀할 때 1회 소비합니다. 5분이 지났거나 다른 진입이면 무시되어 항상 최신 데이터가 우선되도록 했습니다.

---

## 기능 2. 게시글 공개/비공개(visibility) 정책 + 블러 카드

### 한 줄 요약
치료사 전용 게시글을 일반 회원에게 "내용은 가리되 존재는 보이는" 블러 카드로 노출하여 가입 전환 동선을 확보

### Situation
- 멜로미는 일반 사용자(USER)와 인증 치료사(THERAPIST) 두 권한이 공존
- 치료사 전용(`PRIVATE`) 게시글에 대한 응답 정책이 디자이너/백엔드 사이에서 어긋나 있었음
  - 디자이너 의도: 목록에는 노출하되 본문은 블러 + "인증 회원 전용" 안내 → 가입 유도
  - 백엔드 초기 동작: USER 응답에서 PRIVATE 글을 아예 제외 → 콘텐츠가 존재한다는 신호 자체가 사라짐

### Task
- 두 입장 차이를 정리해 회의 안건으로 올리고, 합의된 정책을 프론트·mock·백엔드 전반에 일관되게 반영

### Action
- 충돌 지점을 정리해 04-14 데일리 스크럼에 안건 상정 → 디자이너 안(블러 카드) 채택
- 프론트:
  - `PostCard`/`PostDetailPage`의 `isBlurred` 분기 복원 및 안내 카피·접근성(aria-label) 정리
  - USER 롤에서도 PRIVATE 카드가 목록·상세에 노출되도록 라우팅·렌더링 흐름 점검
- MSW: `isBlurred=true` + 빈 `content`/`contentPreview`로 응답하도록 mock을 디자이너 안과 일치시켜, 백엔드 수정 전부터 프론트 회귀를 방지
- 작성자 측 UI: `PostCreatePage`에 자물쇠 토글(`LockOpen`/`Lock`) 추가, 모바일/데스크탑 레이아웃 분기로 한 줄 정렬
- 백엔드에는 동일 응답 정책으로 맞춰달라는 요청을 GitHub Issue로 추적

### Result
- 04-14 main 머지 완료(770e7af, 9b88447 등), USER가 비공개 글의 존재를 인지하고 가입으로 이어질 수 있는 동선 확보
- mock과 디자이너 시안이 일치하여, 백엔드 정책 반영 전후로도 프론트 회귀 위험 없음
- 백엔드 응답 정책 반영은 추적 중 (대기 항목으로 메모리·이슈에 등록)

### 면접 예상 질문 & 답변 포인트
- **Q. 디자이너와 백엔드의 정책이 다를 때 어떻게 조율했나요?**
  - A. 먼저 어떤 응답이 어느 사용자 경험으로 이어지는지를 사례로 정리했습니다. "USER에게 글을 빼면 콘텐츠 존재 자체를 모르고, 가입 유도 동선과 기존 블러 UI 자산이 무용해진다"는 점을 근거로 디자이너 안을 채택하자고 제안했고, 데일리 스크럼에서 합의했습니다.
- **Q. 백엔드 수정이 늦어지는 동안 프론트는 어떻게 보호했나요?**
  - A. MSW mock을 합의된 디자이너 안에 맞춰 두었습니다. mock이 백엔드 정책 우회를 허용하면 프론트 회귀가 숨겨지기 때문에, mock은 항상 "최종 합의된 백엔드 정책을 시뮬레이션"하는 위치로 운용한다는 원칙을 갖고 있습니다.
- **Q. 권한별 UI 분기에서 신경 쓴 부분은?**
  - A. 단순히 보이고/안 보이고가 아니라, USER에게 "가려져 있다"는 사실 자체를 명확히 전달하는 것이 가입 전환의 핵심이라고 봤습니다. 그래서 카드 자체는 노출하되, 본문 영역에 잠금 안내 + 가입/인증 액션을 함께 두는 형태로 정리했습니다.

---

## 이력서 한 줄 버전 (참고)
- 메인 피드 커서 기반 무한 스크롤 도입 — IntersectionObserver + AbortController + requestId 가드로 race/취소 안전성 확보, Zustand 기반 스크롤 복원(TTL 5분) 구현
- 권한별 게시글 공개/비공개 정책 정리 — 디자이너/백엔드 충돌을 회의 안건으로 올려 블러 카드 정책으로 합의, MSW를 합의된 정책에 맞춰 프론트 회귀 방지

---

# 설계 결정 & 아키텍처 — 04-15 — feed 실패 시 pagination auto-fallback 설계

## 1. fallback 트리거 정책 7개 결정

**문제:** 백엔드 `/posts/feed`가 임시로 500을 뱉는 상황에서 메인 피드가 무력화. 무한 스크롤을 유지하면서도 feed 실패 시 안전하게 pagination으로 내려오는 경로가 필요.

**검토한 선택지:**
- (a) 무한 스크롤 비활성화 — 임시 회피지만 사용자 경험 후퇴
- (b) 진입 시 시도 → 실패 시 1회 fallback — 정상 복구 시 자동 재활성화
- (c) sticky per-session 플래그 — 새로고침에도 살아남지만 복구 탐지 경로 없음

**결정:** (b) 채택. 다음 7가지 세부 정책 확정.
1. 필터 칩은 기존 pagination 유지 (백엔드 `/posts/feed`가 `therapyArea` 파라미터 받기 전까지)
2. Sticky 아님 — mount 단위로만 유지, 새로고침/재진입 시 재시도
3. 렌더 실패하는 모든 에러 (4xx/5xx/네트워크) = fallback 트리거. 401은 인터셉터가 먼저 처리하므로 자연 통과
4. 로딩 UX는 인라인 안내 텍스트 1줄 (완전 무음 교체 지양)
5. 디버깅 우선 — P0 drift 버그 먼저 클로즈 후 새 설계 (재발 방지)
6. fallback 로직은 임시 가드가 아니라 pagination 엔드포인트 제거 시점까지 영구 유지
7. 적용 범위 `/posts`에만 한정 (SearchPage/ProfilePage 보류)

---

## 2. "한 mount 1회 시도" 보장 메커니즘

**문제:** P0 버그(`d776f85`)에서 `isInfiniteMode` flip으로 `useInfiniteFeed`가 재활성화 → 중복 요청/race. 새 설계에서 같은 메커니즘이 살아남으면 안 됨.

**검토한 선택지:**
- (a) fallback 신호를 부모의 `useEffect(() => watch(infinite.error))`로 감지 — render→commit→effect 한 프레임 지연. 그 사이 다른 effect가 enabled 재평가 가능 (P0 재발 위험)
- (b) `useInfiniteFeed`에 `onError` 콜백 prop — 훅 내부 catch에서 즉시 동기 호출. setError + setFeedFailed가 React batching으로 한 번의 리렌더에 처리됨

**결정:** (b) 콜백 + `feedFailed` state를 단방향(false→true)으로 운용.
- `feedFailed=true`가 되면 `isInfiniteMode=false`로 고정, 어떤 사용자 액션(필터 칩/탭/URL)으로도 false로 돌아가지 않음
- 해제 경로는 unmount/remount만 (`useState(false)` 초기값)
- 회귀 가드: 코드베이스 어디에도 `setFeedFailed(false)` 등장 금지 (grep 필수)

---

## 3. onError 콜백의 stale closure 회피

**문제:** 부모가 매 렌더 새 함수 객체로 `onError`를 전달. useCallback deps에 그대로 넣으면 `fetchPage`가 매 렌더 재생성 → fetch effect가 매 렌더 abort+재시작 → 04-14 race 재현.

**검토한 선택지:**
- (a) deps에 `options.onError` 포함 — race 재발
- (b) 부모가 useCallback으로 stable 참조 전달 — 호출부에 규율 강제, 잊으면 즉시 회귀
- (c) 훅 내부에서 `onErrorRef = useRef(options.onError)` + 매 렌더 `onErrorRef.current = options.onError` 동기화 — latest 참조 보장 + fetchPage stability 유지

**결정:** (c) Latest ref 패턴. 04-14 `requestIdRef` 패턴과 같은 부류. 호출부에 규율을 요구하지 않아 안전.

---

# TIL — 2026-04-15 — onErrorRef latest-ref 패턴과 React batching으로 1회 시도 보장

**분류:** React 패턴 / 상태 머신 설계

## 오늘 한 것
- `/posts/feed` 500 대응 fallback 구현 (커밋 f4a50cc, 3파일 변경)
- `useInfiniteFeed`에 `onError` 콜백 prop 추가 + `onErrorRef` 패턴 적용
- `PostListPage`에 `feedFailed` state(단방향 sticky-per-mount)로 모드 분기 고정
- MSW에 `FORCE_FEED_500` 검증 토글 추가 (기본 false)

## 배운 것 / 인사이트

### 1. Latest ref 패턴 — 콜백 prop을 useCallback deps에서 제외하는 법
- 부모가 매 렌더 새 함수 객체로 콜백을 넘길 때, deps에 직접 넣으면 하위 useCallback/useEffect가 매 렌더 재생성/재실행 → abort+재시작 race
- 해법: 훅 내부에서 `ref.current = options.callback`를 매 렌더 동기화. 소비 시점에는 `ref.current?.()`로 latest 참조만 읽음 → deps에서 빠지면서도 최신 값 보장
- 04-14 `requestIdRef`(응답 순서 가드)와 구조가 같음. "mutable reference로 closure stale 문제 우회"라는 같은 가족

### 2. React batching으로 "상태 머신 한 스텝 이동" 보장
- catch 블록에서 `setError(...)` + `onErrorRef.current?.()`(내부에서 `setFeedFailed(true)`) 두 set state가 batching으로 한 번의 리렌더에 처리됨
- 다음 렌더에서 `feedFailed=true` → `useInfinite=false` → `enabled=false` → fetch effect cleanup만 실행되고 종료. 중간에 "isInfiniteMode=true인 프레임"이 존재하지 않음
- 반면 부모 `useEffect(() => watch(error))` 방식은 render→commit→effect 한 프레임 지연. 그 사이 다른 effect가 enabled를 재평가할 여지 생김
- 교훈: **fallback/상태 전환 신호는 "지연 없는 동기 콜백"이 effect watch보다 안전**

### 3. 단방향 state로 재진입 자체를 봉쇄
- `feedFailed`는 false→true 단방향. reset 경로를 아예 코드에서 제거
- 결과: 필터 칩 클릭, 탭 토글, URL 변경 등 어떤 사용자 액션도 `isInfiniteMode`를 true로 되돌릴 수 없음 → 한 mount 1회 시도 기계적으로 보장
- 회귀 가드는 정적: "`setFeedFailed(false)`가 grep에서 나오면 안 됨" 한 줄

## 포트폴리오 어필 포인트
- **race 재발 방지 설계력:** P0 drift 버그(d776f85)를 해결한 직후 새 fallback 설계에서 같은 메커니즘이 살아남지 않도록 "단방향 state + 동기 콜백 + latest ref" 3중으로 방어
- **라이브러리 없이 상태 머신 원리 학습:** React Query `useInfiniteQuery`로 이관 전에 batching/effect 타이밍/closure stale을 직접 다뤄봄
- **검증 가능한 설계:** MSW `FORCE_FEED_500` 토글로 팀원 누구나 수동 검증 가능. 6개 시나리오 스펙 문서화

---

# 📈 프로젝트 성과 & 지표 — 04-17 — 백엔드-프론트 API 이슈 전면 정리 및 블로킹 해소

## 블로킹 항목 정리 성과
- 기존 블로킹 대기 7건(B-01~B-06) → 정리 후 5건으로 감소 (P0 1건, P1 4건)
- **해소 3건**
  - B-02 title 필드 optional 반영
  - B-05 `scrapped` 필드 백엔드 추가 → 프론트 연동 완료
  - B-06 isNewUser 하드코딩: 회원가입 = 첫 로그인 전제의 의도된 처리로 확정
- **신규 분리 2건**
  - BE-PERM USER 롤 `canWritePrivatePost` 권한 필드 도입
  - BE-FILE 첨부파일 이미지 MIME 허용 여부 확인
- **UI 섹션 → 완료 아카이브 이동**
  - U-04 검색 API (페이지네이션 버전 구현 완료)
  - U-07 공개/비공개 토글 API 연동 (이미 `visibility: PUBLIC|PRIVATE` 전송 중 확인)

## 프론트 최신화 커밋 2건
- `0bbb77b` — B-05 scrapped 필드 초기값을 PostCard/PostDetailPage에 연동
  - `PostCard`: prop으로 post를 즉시 받으므로 `useState(post.scrapped ?? false)` 초기값으로 해결
  - `PostDetailPage`: post를 fetch로 받으므로 Promise.all 성공 콜백에서 `setScrapped(postData.scrapped ?? false)` 동기화
  - 데이터 수명주기(prop-driven vs fetch-driven) 차이를 반영한 동기화 시점 분리 설계
- `b66aefd` — B-01 프로필 이미지 localhost origin 치환 핫픽스
  - `resolveImageUrl`에서 `http://localhost:8080` → 배포 origin 치환
  - 백엔드 수정 배포 후 제거 예정 (한시적 핫픽스)

## 전달 전략 정립
- P0(B-01) 단독 선공유 → P1 4건 일괄 공유 우선순위 결정
- 전달 원칙: "왜 문제인지 + 기대 결과"만 전달, 구현 방식은 백엔드에 위임 (기존 원칙 재확인 + 케이스 적용)
- backlog.md 섹션 리모델링: B-넘버링 유지 + BE-PERM/BE-FILE 접두 분리로 넘버링 충돌 회피

## 이력서 bullet 예시
- 블로킹 중인 백엔드 API 이슈 7건을 코드·메모리·Swagger 교차검증으로 재분류, 3건 해소·2건 세분화하여 백엔드 전달용 우선순위 문서 작성
- 백엔드 응답 필드 추가(`scrapped`)를 프론트에 즉시 반영, 데이터 수명주기(prop vs fetch)에 따라 동기화 시점을 분기 설계 — PostCard는 prop 초기값, PostDetailPage는 fetch 성공 콜백에서 setter 호출

---

# 🔧 트러블슈팅 — #NNN — PostCard useState 두 줄 적용 위치 오류

**날짜**: 2026-04-17
**분류**: React useState / 코드 수정 실수
**난이도**: ★☆☆ (간단하지만 실전에서 자주 재현되는 패턴)

## 문제 상황
- B-05(백엔드 `scrapped` 필드 응답) 반영을 위해 `PostCard.tsx`에서 `useState` 초기값 수정이 필요했음
- 원래 변경 대상: 19줄 `const [scrapped, setScrapped] = useState(false)` → `useState(post.scrapped ?? false)`
- 실제 적용 결과: 바로 아래 20줄 `scrapLoading` 쪽에 `post.scrapped ?? false`가 잘못 들어감
- **증상**: 이미 스크랩한 글이 목록 진입 즉시 `scrapLoading === true`로 시작 → 버튼 disabled → 사용자가 클릭해도 반응 없음. `scrapped`는 여전히 `useState(false)` 고정이라 **B-05 자체도 해결 안 됨**

## 원인 분석
- 두 줄이 인접해있고 둘 다 원래 `useState(false)` 패턴 → 수정 시 줄 식별 시각적 실수
- 타입 체크(tsc)는 `boolean` 자리에 `boolean`이 들어간 거라 통과 → **컴파일러는 실수 감지 못 함**
- 리뷰 단계에서 "컴파일 잘 되니까 맞겠지"로 넘어가면 런타임 증상이 드러나기 전까지 못 잡음

## 해결 과정
1. 수정 직후 파일 재읽기(Read tool)로 실제 라인 확인
2. 19-20줄이 뒤바뀐 것 발견
3. 두 줄 순서만 교정:
   ```tsx
   const [scrapped, setScrapped] = useState(post.scrapped ?? false);
   const [scrapLoading, setScrapLoading] = useState(false);
   ```

## 핵심 개념
- **useState 초기값은 런타임 state를 결정하지만, 타입 체크는 실수를 못 잡는다** — 둘 다 `boolean`이면 TypeScript는 무사 통과
- **수정 후 "결과 파일 직접 재읽기"가 최소 체크리스트** — 특히 인접 줄에 같은 패턴이 있을 때
- `tsc -b`는 "타입이 맞는 실수"를 절대 못 잡음 → 단위 테스트 / E2E / 수동 DevTools 검증이 필요

## 면접 포인트
- **Q. 간단한 수정에서 왜 실수했나요?**
  - A. 두 줄이 인접해 있고 둘 다 동일 패턴(`useState(false)`)이라 줄 식별을 시각적으로 잘못했습니다. 이후에는 수정 후 반드시 해당 줄을 직접 다시 읽어 확인하는 절차를 습관화했습니다.
- **Q. 이런 실수를 방지하려면 어떻게 설계를 바꿀 수 있을까요?**
  - A. (1) 런타임 검증: E2E나 Storybook 스냅샷으로 초기 렌더 상태를 자동 검증. (2) 구조 리팩토링: 단일 컴포넌트에 `useState` 개수를 줄이기 위해 `useScrap` 같은 커스텀 훅으로 분리 → 인접 useState가 줄면 실수 여지도 준다.

---

# 💡 TIL — 2026-04-17 — git 클린 커밋 히스토리를 위한 섞인 스테이징 분리 실전

**분류**: Git / 협업 워크플로우

## 오늘 한 것
- 한 세션에 뒤섞인 9개 파일을 3개 논리 단위 커밋으로 분리
  1. `0bbb77b` — B-05 scrapped 필드 프론트 연동 (PostCard, PostDetailPage)
  2. `b66aefd` — B-01 프로필 이미지 localhost origin 핫픽스 (resolveImageUrl)
  3. `b8bffb9` — 백로그 최신화 + 메모리 정리 + Prettier 포매팅 (6개 파일)

## 배운 것 / 인사이트

### 1. 커밋 직전 `git status` 진단이 핵심
- "이미 스테이징된 것 + unstaged 변경"이 주제가 다른 채 공존하면 **그대로 커밋 금지 신호**
- 그 상태로 그냥 커밋하면 포매팅/기능/메모리가 한 덩어리 → 나중에 특정 기능 찾을 때 관련 없는 diff까지 전부 헤쳐야 함

### 2. 섞인 스테이징 분리 패턴
- `git reset HEAD` → 스테이징만 초기화 (워킹 트리 변경은 유지)
- 주제별로 `git add <관련 파일만>` → `git commit -m "..."` 반복
- 한국어 커밋 메시지 컨벤션: "동사 중심 + 1줄 제목 + 필요 시 body에 bullet"

### 3. "미래의 읽기"를 기준으로 분리 단위 설계
- 기준: 나중에 이 커밋을 **누가·어떤 맥락에서** 읽을 것인가
- B-05와 B-01은 내용이 완전히 다른 작업 → 섞이면 롤백 시 부수 피해
- 포매팅 + 주석 + 메모리는 논리적으로 "환경 정리"라서 한 커밋에 묶어도 무방
- 분리의 비용(시간) vs 통합의 비용(히스토리 탐색 난이도)을 저울질

## 포트폴리오 어필 포인트
- **성숙한 협업 의식**: "일단 다 커밋"이 아니라 "나중의 히스토리 독자"를 상정하고 커밋 단위를 설계
- **정적 원칙 + 동적 판단**: 메모리에 클린 커밋 룰을 저장해두되, 매 커밋마다 `git status` 진단 → 섞임 탐지 → 분리라는 실천 루프를 돌림
- **의도 기반 메시지**: `[동사] + [대상] + [근거]` 구조로 한국어 메시지 통일 (forward-only 룰 적용, 과거 영어 커밋은 rewrite 없이 둠)
