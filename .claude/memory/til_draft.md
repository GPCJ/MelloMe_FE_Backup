# TIL

## 2026-04-13 — 커서 기반 무한 스크롤 + 협업 워크플로우 시뮬레이션

**분류**: React / 협업 / AI활용

### 오늘 한 것
- MSW 환경에서 커서 기반 무한 스크롤 선구현 착수 (백엔드 CORS 차단 우회)
- AI 협업 워크플로우 4단계 적용: brainstorming → deep-interview → writing-plans → subagent-driven-development
- Deep interview로 요구사항 모호성을 38% → 11.5%까지 수치적으로 측정·축소
- 6-task 구현 plan 작성, 1~4번 완료 (타입 정의, fetchFeed API, MSW mock 핸들러, useInfiniteFeed 훅)
- main 단독 개발 → feature branch + PR + `merge --no-ff` 협업 워크플로우로 전환

### 배운 것 / 인사이트

**1. Cursor 기반 페이지네이션 ― opaque token 패턴**
- cursor는 마우스 커서가 아니라 "다음 호출 때 어디부터 줄지 가리키는 책갈피"
- 서버가 만든 cursor를 프론트는 **그대로 보관했다 다시 보냄** (캐치볼처럼 왕복)
- base64로 감싸는 이유: 프론트가 내용을 읽고 의존하는 걸 차단 → 백엔드가 cursor 형태를 바꿔도 프론트 안 깨짐
- ❌ "보안" 효과는 미미 (base64는 암호화가 아님). 진짜 보안은 백엔드가 HMAC 서명까지 붙여서 처리
- 이게 JWT, OAuth refresh token, DB cursor에 공통으로 쓰이는 **opaque token 패턴**

**2. Cursor vs Offset 트레이드오프**

| | Offset | Cursor |
|---|---|---|
| 임의 페이지 점프 | ✅ | ❌ |
| 새 글 추가 시 중복/누락 | 발생 | 없음 |
| 빅데이터 성능 | 떨어짐 | 빠름 |
| 무한 스크롤 적합도 | △ | ✅ |

- offset은 새 글 1개 추가되면 모든 페이지가 한 칸씩 밀려서 **이전 페이지 마지막 글이 다음 페이지 첫 글로 다시 등장 (중복 버그)**
- cursor는 책갈피 위치가 고정이라 중복/누락 없음

**3. AbortSignal/AbortController ― 무한 스크롤의 race condition 방어**
- 브라우저 표준 Web API, 백엔드와 무관한 클라이언트 측 메커니즘
- 무한 스크롤에서 빠른 스크롤 시 요청 A가 응답 안 왔는데 요청 B 트리거 → 응답 순서가 뒤바뀌면 화면이 깨짐
- 새 요청 시작 시 이전 요청을 abort (헌 거 버리고 새 거 우선)
- React 훅에서 `useRef<AbortController>`로 인플라이트 가드 + unmount cleanup으로 메모리 누수 방지

**4. Subagent-driven development 개념**
- 메인 Claude는 지휘자, Task마다 새 서브에이전트 디스패치 → 서브가 작업·commit·자체검토 → 메인이 결과 받아 사용자에게 보고
- 메인 컨텍스트가 매 Task의 상세 코드로 더러워지지 않음 → 큰 작업에서도 여유 유지
- Task 격리로 한 Task의 실수가 다음 Task에 새지 않음

**5. Deep interview의 수치적 ambiguity gating**
- Goal/Constraints/Success Criteria/Context 4개 차원에 가중치 점수
- 가장 약한 차원만 골라 다음 질문으로 → 효율적 수렴
- 임계값(20%) 미만일 때만 spec 작성 진행 → "내가 원하는 게 뭔지 모르는 상태"로 코드 작업 시작 방지

### 포트폴리오 어필 포인트
- **opaque token 패턴 이해**: "cursor를 base64로 감싸는 이유는 프론트가 내부 구조에 의존하지 않게 하는 opaque token 패턴이고, 진짜 보안은 백엔드 서명 책임" — 면접 답변 가능
- **AI 활용 능력**: brainstorming → deep-interview → plan → subagent execution이라는 4단계 파이프라인을 이해하고 실제 프로젝트에 적용
- **백엔드 차단 상황 우회**: CORS 문제로 막힌 상황에서 MSW로 가짜 백엔드를 만들어 프론트 작업을 멈추지 않음 → 협업 환경에서 실용적 문제 해결력
- **협업 워크플로우 자가 학습**: solo 개발의 한계(main 단독 사용)를 자각하고 feature branch + PR + `merge --no-ff` 워크플로우로 자발적 전환

---

# 빌더스 리그

## 🤖 AI 협업

### Brainstorming → Deep Interview → Plan → Subagent Execution 4단계 파이프라인

작업 시작 전에 무작정 코딩하지 않고 4단계로 분리해서 진행:

1. **Brainstorming** — Q&A로 큰 결정 6개 확정 (커서 기반 / PostListPage만 / React Query 미도입 / 하이브리드 분기 / Skeleton+재시도 UX / 스크롤 복원)
2. **Deep Interview** — 4개 차원 ambiguity 점수로 모호성을 38% → 11.5%까지 수치적으로 측정. MSW mock 정책(데이터 양/cursor 형태/권한/size 클램핑) 일괄 결정
3. **Writing Plans** — 6-task로 분해, 각 task = 1 commit, 각 task 끝에 사용자 보고 step
4. **Subagent-driven** — Task마다 새 서브에이전트 디스패치 + 메인은 리뷰만

**효과:** "일단 짜고 보자"보다 시간이 더 걸린 것 같지만, 실제로는 **재작업 0회**. 모든 결정이 사전에 수치적으로 검증됨. 면접에서 "AI 도구를 어떻게 활용하나?" 질문에 구체적 워크플로우로 답할 수 있게 됨.

### MSW로 백엔드 차단 우회

CORS 문제로 백엔드 호출 불가 상태에서 무한 스크롤 작업을 멈추지 않기 위해 MSW에 커서 기반 mock(`GET /posts/feed`)을 직접 작성. 백엔드 가이드(FEED_API_GUIDE.md)와 응답 형태를 100% 일치시켜서 CORS 풀리면 MSW만 끄면 그대로 동작하도록 설계.

## 🏗 설계 결정

### 1. 필터 모드 하이브리드 분기

**문제:** 새 커서 엔드포인트 `/posts/feed`는 `therapyArea` 필터 파라미터를 지원하지 않음. 기존 PostListPage는 필터 칩 UI가 있음.

**선택지 4개를 검토:**
- A. 필터 칩 제거 (가장 단순)
- B. 하이브리드 (필터 없을 때 무한 스크롤, 있을 때 기존 offset)
- C. 필터 비활성화 + 백엔드 요청
- D. 백엔드 추가 후 진행 (작업 보류)

**결정: B** ― 사용자에게서 필터 기능 빼앗지 않음 + "필터 없는 메인 피드만 무한 스크롤"은 인스타/트위터 패턴과 일치 + 훅 레벨 분기로 격리 + 백엔드 추가 후 통합 가능. 트레이드오프: 코드 두 갈래.

### 2. React Query 미도입 결정

**선택지:** 직접 구현 vs React Query (`useInfiniteQuery`)

**결정: 직접 구현** ― 멜로미 전체가 직접 fetch 패턴이라 한 페이지 때문에 전사 도입 과함. React Query는 로드맵 "언젠가" 단계로 분류. 직접 구현으로 IntersectionObserver/커서 페이지네이션 패턴 학습 효과. 나중에 React Query로 마이그레이션해도 훅 인터페이스만 바꾸면 됨.

### 3. 정렬 토글 미포함 결정

**고민:** 백엔드가 LATEST/POPULAR `sort` 파라미터도 지원. +2~3시간이면 추가 가능.

**결정: LATEST 고정, 별도 PR** ― 작업량보다 디자이너 시안 부재가 더 큰 부담. "전체 피드/팔로우" 탭 아래에 또 토글 추가 시 시각적 위계 복잡. 디자이너 시안 없이 임시 UI로 넣었다가 갈아엎는 패턴 회피. 본 작업 완료 후 디자이너에게 시안 요청 → 받으면 합치는 흐름이 자연스러움.

### 4. main 단독 → feature branch + PR + merge --no-ff 전환

**고민:** solo 개발이라 main만 써왔는데 면접에서 "협업 시 어떻게 할 건가?"에 직접 경험 기반 답이 어려움.

**결정: 이번 작업을 PR 워크플로우 첫 시도로** ― feature branch에서 6 task 진행 → PR 생성 → self-review → `merge --no-ff`로 머지 포인트 보존. squash 안 함(atomic commit 6개 히스토리 유지가 면접에 더 좋음). gh CLI 이미 설치되어 있어서 도구 부담 0.

## 🛠 트러블슈팅

### MSW 핸들러 등록 순서 (잠재적 버그 사전 방지)

서브에이전트가 Task 3 자체검토 단계에서 발견:
- `GET /posts/feed`가 `GET /posts/:postId`보다 **앞에** 등록되어야 함
- 그렇지 않으면 MSW가 `/posts/feed`를 `/posts/:postId`로 매칭(`postId="feed"`)해서 entirely wrong path로 빠짐
- MSW는 핸들러 배열 순서대로 매칭하기 때문

**원리 학습:** 라우팅 시스템(MSW, Express, React Router 등)에서 더 구체적인 경로(`/posts/feed`)는 더 일반적인 경로(`/posts/:id`)보다 먼저 등록해야 한다는 일반 원칙.
