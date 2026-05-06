---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /report-notion으로 업로드 가능.
type: draft
updated: 2026-05-06
originSessionId: 40bae66f-eb40-464f-9ef2-fc78c83fb4ff
---

# 1) 📈 프로젝트 성과 & 지표 — `05-04 — R-10 댓글 리액션 API 연동 성과`

게시글과 동일한 3종(LIKE/CURIOUS/USEFUL) 토글을 댓글에도 도입하여, 게시글/댓글 양쪽에서 같은 리액션 UX를 제공할 수 있게 되었습니다.

## 적용 범위

- **타입 (`types/post.ts`)**: `CommentResponse`에 `likeCount` / `curiousCount` / `usefulCount` / `myReactionType` 4필드 옵셔널 추가, `CommentReaction` 인터페이스 신설
- **API (`api/posts.ts`)**: `getCommentReaction` / `toggleCommentReaction` 추가(unwrap 패턴). 게시글 쪽 `getReaction` → `getPostReaction` 리네임 + unwrap 적용. 호출부 0건 dead code 정리
- **ReactionBar (`components/post/ReactionBar.tsx`)**: `PostReaction` 의존을 제거하고 `counts` / `myReactionType` / `size` 형태의 일반화된 props로 전환. 게시글/댓글 양쪽에서 재사용 가능
- **useCommentReactionToggle (`hooks/useCommentReactionToggle.ts`)** 신설: 페이지 레벨 단일 hook이 `comments` 배열과 `setComments`를 받아 진실을 단일화. 낙관 업데이트 → PUT → 응답으로 reconcile → 실패 시 롤백
- **CommentCard / PostDetailPage / CommentDetailPage**: 임시 placeholder 제거 후 `ReactionBar` 연동, hook 호출 + props 전달. `CommentDetailPage`는 parent + replies가 별도 state라 가상 배열과 분배 setter 어댑터로 hook과 연결

## 검증

- `npx tsc -b` 통과(EXIT 0). R-07 후속 작업과 베이스 mismatch 9건은 `CommentInput.onSubmit` 호출부 3곳을 함께 정리하여 해소(`(e) => handleSubmitComment(e, content)` → `() => handleSubmitComment(content)`)
- MSW 핸들러는 의도적으로 스킵. 백엔드가 dev/staging에 이미 배포되어 있어 `comments.handlers.ts`에 가짜 토글 로직을 만드는 대신 staging 직접 테스트로 검증

## 한계점 (박제)

- 댓글 리액션 사용 데이터는 현재 수집되지 않습니다. GA4 이벤트 스펙에 댓글 리액션 토글 항목이 없어, 기능 동작은 확인되어도 도메인 효용(어떤 리액션이 댓글에서 더 쓰이는지)은 측정 불가
- `PostSummary`에는 여전히 `myReactionType`이 포함되지 않습니다. 게시글 카드 리스트 단계에서는 별도 GET 호출이 필요한 구조 유지

## 이력서 bullet 예시

- 게시글 리액션 시스템을 댓글에도 확장하면서 `ReactionBar` 컴포넌트의 props를 도메인 비종속(`counts`/`myReactionType`)으로 일반화하여, 향후 다른 도메인(첨부파일/공지 등)에 동일 컴포넌트를 재사용할 수 있도록 설계했습니다.
- 백엔드와 협의해 댓글 응답에 리액션 4필드를 직접 동봉하도록 하여 댓글 N개당 리액션 GET을 별도로 호출하던 N+1 패턴을 회피했습니다.

---

# 2) 🏗 설계 결정 & 아키텍처 — `05-04 — 댓글 리액션 hook 설계 (B 패턴 + PUT reconcile)`

## 1. 댓글 리액션 hook은 페이지 레벨 단일 hook(B 패턴)으로 둔다

**문제:**
게시글 리액션은 `PostCard` 또는 `PostDetailPage`에서 카드별로 hook을 호출하는 A 패턴을 씁니다. 댓글 리액션도 동일한 A 패턴(`CommentCard`마다 hook 호출)으로 갈지, 페이지 레벨에서 단일 hook이 `comments` 배열 전체를 관리하는 B 패턴으로 갈지 결정이 필요했습니다.

**검토한 선택지:**
- **A 패턴 (카드별 hook)**: 게시글과 일관성. 단, `CommentCard`마다 hook 호출이 일어나 동일 댓글 리스트의 진실이 카드별로 분산됨
- **B 패턴 (페이지 단일 hook)**: 부모 페이지가 이미 `comments` 배열을 들고 있고(`useComments`로 작성/삭제/편집도 같은 배열에서 닫혀 있음), 진실의 단일화 지점이 부모임

**결정:** B 패턴 채택.

근거:
- 게시글은 부모(목록 페이지)가 들고 있는 진실이 "여러 게시글"이지만 각 게시글의 리액션 상세는 카드 내부에 들어가는 게 자연스럽습니다(목록은 요약만 표시).
- 댓글은 부모(상세 페이지)가 이미 `comments` 배열 전체와 그 mutation 책임을 갖고 있어서, 리액션만 카드로 빼면 진실이 두 곳으로 갈라집니다.
- A vs B는 "컴포넌트 구조 차이"가 아니라 **부모가 이미 들고 있는 진실의 형태 차이**에서 갈렸습니다.

게시글까지 B로 통일하는 작업은 R-08(별도 작업)로 분리합니다.

---

## 2. 토글은 낙관 업데이트 + PUT 응답 reconcile로 보강한다

**문제:**
리액션 토글 UX는 즉시 반영이 필요하므로 낙관 업데이트가 기본입니다. 그러나 낙관 업데이트만 쓰면 동시성 충돌, 백엔드 카운트 계산 규칙 변경, 권한 차단 등에서 클라이언트 추측값과 서버 실제값이 어긋날 위험이 있습니다.

**검토한 선택지:**
- **낙관 업데이트만**: 단순하지만 서버 truth와의 어긋남 가능성
- **PUT 후 GET refetch**: 안전하지만 라운드트립 1회 추가
- **PUT 응답 본문에 서버 truth 동봉 → reconcile**: 한 번의 네트워크 호출로 서버 상태 반영 가능

**결정:** 낙관 업데이트 → PUT → 응답으로 reconcile → 실패 시 롤백 패턴 채택.

근거:
- 백엔드가 PUT 응답에 갱신된 카운트와 `myReactionType`을 함께 내려주므로, 별도 GET 없이도 서버 truth로 클라이언트 흉내값을 덮어쓸 수 있습니다.
- 게시글 쪽 R-08도 같은 방향으로 통일 예정입니다.

---

## 3. CommentResponse에 reaction 4필드를 동봉한다 (백엔드 합의)

**문제:**
댓글마다 `GET /comments/{id}/reaction`을 별도 호출하면 댓글 N개에 대해 N+1 GET이 발생합니다.

**검토한 선택지:**
- 댓글 응답과 리액션 응답을 분리(REST 정합성↑, 호출 N+1)
- 댓글 응답에 리액션 4필드 동봉(REST 정합성↓, 호출 1회)

**결정:** 댓글 응답에 `likeCount` / `curiousCount` / `usefulCount` / `myReactionType` 4필드 동봉.

근거:
- 댓글 리스트 진입 시 모든 댓글의 리액션 상태가 항상 함께 필요하므로, 분리해도 호출이 항상 짝지어 발생합니다. 페이로드를 한 번에 받는 게 일관됩니다.
- 2026-05-04 Swagger 재확인으로 4필드 응답 동봉 확정.

---

# 3) TIL — `2026-05-06 — 회원가입 환영 모달 구현 (Figma → semantic HTML + localStorage 신호)`

**분류**: UI 구현 / Figma 변환 / 컴포넌트 간 신호 전달 / 리팩토링 구상

## 오늘 한 것

회원가입 직후 게시글 피드(`/posts`) 위에 환영 모달이 1회 노출되는 X/Threads 첫 진입 패턴을 구현했습니다. 변경 파일 3개:

- `frontend/src/components/auth/WelcomeModal.tsx` (신규, 57줄)
- `frontend/src/pages/auth/SignupPage.tsx` (inline 환영 UI 44줄 제거 → localStorage 신호 + navigate)
- `frontend/src/pages/post/PostListPage.tsx` (마운트 시 1회 트리거 +22줄)

피그마 시안 노드 `1373:9285`(PC) + `1373:9557`(Mobile) — 모달 자체는 PC/Mobile 동일, 좌우 32px 여백만 다름 → 단일 컴포넌트로 처리.

## 배운 것 / 인사이트

### 1. Figma React export는 모든 요소를 `<div>`로 떨군다

피그마 MCP/Dev Mode export는 시각만 보존하고 의미 정보(이게 제목인지 본문인지 버튼인지)는 갖고 있지 않습니다. semantic HTML 부여는 개발자가 변환 단계에서 직접 합니다.

변환 4단계:
1. 제목 텍스트 `<div>` → `<h1>`/`<h2>`/`<h3>` (계층에 맞게)
2. 본문 텍스트 `<div>` → `<p>` (단락이면)
3. 인터랙티브 `<div onClick>` → `<button>`/`<a href>` (네이티브 키보드/포커스/스크린 리더 동작)
4. 모달 컨테이너 → `role="dialog" aria-modal="true" aria-labelledby="..."` (shadcn Dialog 미사용 시)

판별 기준: "이 요소를 키보드 Tab으로 포커스해서 Enter로 동작시켜야 하는가?" → Yes면 무조건 `<button>`/`<a>`.

### 2. 컴포넌트 간 신호 전달 — localStorage 비유

페이지 이동(navigate) 후 다른 컴포넌트에 "환영 모달 띄워줘" 신호를 전달해야 했습니다. 비유로 **포스트잇 메모**:

```
SignupPage(방 A) ─────────────────→ PostListPage(방 B)
   회원가입 끝              navigate('/posts')

이때 방 A에서 책상 위에 포스트잇:
  ┌─────────────────────────────┐
  │ mello:welcome-pending = '1' │  ← "환영 모달 띄워줘!"
  └─────────────────────────────┘
                 ↓
방 B 들어가면서 책상 보고 → 모달 띄움 → 포스트잇 떼서 버림
```

옵션 비교:
- React state(`useState`) — 컴포넌트 unmount 시 사라짐, 페이지 이동 시 못 읽음 → 부적합
- `useLocation().state` (React Router) — 새로고침 시 사라짐, 일관성 X → 부적합
- `localStorage` — 영구 저장, 새로고침 견고 → 채택
- Zustand store — persist 미들웨어 추가 필요, MVP 범위 외 → 보류

키 네이밍 `mello:welcome-pending` — `mello:` 프로젝트 prefix로 다른 라이브러리/스크립트와 충돌 방지 (관례).

### 3. 모달 a11y 3속성

스크린 리더 사용자가 모달을 인식하려면 외곽 컨테이너에 ARIA 명시 필요:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="welcome-title"
>
  <h2 id="welcome-title">환영합니다!</h2>
  ...
</div>
```

- `role="dialog"` — "이건 대화상자야"
- `aria-modal="true"` — "다른 컨텐츠 비활성, 이것만 다뤄야 함"
- `aria-labelledby="welcome-title"` — "이 dialog의 제목은 id=welcome-title 요소"

### 4. Hot Path 파일에 추가 시 변경 최소화

PostListPage는 메모리 Hot Path 76x — 적층 위험 영역입니다. 무한스크롤/필터 칩/RQ 캐시 갱신 로직이 이미 있어서 회귀 위험을 막으려면 useEffect 1개 + state 1개 + 핸들러 2개만 격리해서 추가하는 게 안전합니다. 기존 로직과 의존성 0으로 유지.

### 5. 적층된 책임을 직접 체감 → 리팩토링 필요성 인지

환영 모달 트리거를 PostListPage에 추가하면서 한 컴포넌트가 떠안고 있는 책임이 7개로 늘어난 걸 체감했습니다.

```
PostListPage (385줄)
├─ state 8개
├─ useEffect 4개
└─ 핸들러 5개
   = 책임 7개:
   ① 검색바  ② 탭(전체/팔로우)  ③ 필터 칩
   ④ 무한 스크롤  ⑤ 페이지 모드 fallback
   ⑥ 리액션 캐시 갱신  ⑦ 환영 모달 (오늘 추가)
```

리팩토링이 필요하다고 판단했고, 어떻게 분리할지 옵션 3개를 비교했습니다(채택은 다음 세션에서 결정):

| 옵션 | 핵심 | 트레이드오프 |
|---|---|---|
| A. custom hook 분리만 | logic만 추출(`useFeedTab`/`useTherapyAreaFilter`/`usePageModeFeed`/`useFeedReactionCache`/`useWelcomeModal`), JSX 0 변경 | blast radius 작음, 테스트 용이 / hook 4-5개 신설 |
| B. JSX도 sub-component 분리 | `<InfiniteFeedSection />` 등으로 마크업도 추출 | 더 깔끔 / Hot Path 큰 변경, 회귀 위험 ↑ |
| C. 라우트/RQ 추상화 | `useFeedQuery` 추상화로 RQ에 fully 위임 | 가장 정리됨 / post-MVP 규모 |

MVP 발표(2026-05-15)까지의 일정과 회귀 위험도(PostListPage는 76번 참조되는 Hot Path)를 같이 봐야 해서 옵션 채택은 다음 세션에서 결정 예정입니다. backlog R-11로 박제 + 다음 세션 진입 시 1순위로 보이도록 notepad priority에 표시.

## 포트폴리오 어필 포인트

- **시각만 주는 디자인 산출물 → 의미 있는 마크업 변환** 4단계 정립. 디자이너의 의도(시각)와 개발자의 책임(의미) 경계 명확히 인지
- **컴포넌트 간 신호 전달 옵션 4가지 비교 후 채택**: React state / location.state / localStorage / Zustand의 트레이드오프 정량 평가
- **a11y 명시적 부여**: shadcn Dialog 같은 헤더리스 라이브러리 미사용 환경에서 직접 ARIA 3속성 부여
- **Hot Path 회귀 방지**: 변경 영역 격리(useEffect 1개 + state 1개)로 76회 참조되는 PostListPage에 충돌 0
- **리팩토링 필요성 인지 + 옵션 비교**: 작업 중 적층된 책임을 발견 → 옵션 3개 트레이드오프 정리 → R-11 backlog/notepad로 다음 세션에 인계 (채택은 별도 결정)

---

# 4) 🏗 설계 결정 & 아키텍처 — `05-06 — 회원가입 환영 모달 구현 결정`

## 1. 모달 노출 흐름 — 피드 위 1회 노출 (X/Threads 패턴)

**문제:**
회원가입 직후 사용자에게 환영 메시지를 보여주면서 즉시 컨텐츠로 진입시키는 방법이 필요했습니다.

**검토한 선택지:**
- A) 별도 `/welcome` 라우트 — 깔끔한 라우팅, 단 시안의 "피드 백그라운드" 의도 미반영
- B) 피드(`/posts`) 위 모달 — 시안 그대로, X/Threads 첫 진입 패턴
- C) SignupPage 내부 인라인 풀스크린 UI — 라우트 변경 0, 단 시안 의도 미반영

**결정:** B 채택 (피드 위 모달).

근거:
- 시안 노드 1373:9285의 명확한 의도(피드 백그라운드 + 환영 모달 오버레이)
- 메모리 `랜딩페이지 폐기 결정 (2026-05-06)` 정합 — 비로그인 `/signup` / 로그인 `/posts` 라우팅과 일관성
- 사용자가 즉시 게시글을 보면서 가치를 인지 → 이탈 방지

---

## 2. 컴포넌트 간 신호 전달 — localStorage 채택

**문제:**
SignupPage(가입 처리) → PostListPage(모달 노출)로 "모달 띄워줘" 신호를 전달해야 했습니다.

**검토한 선택지:**
- A) `useLocation().state` (React Router) — 페이지 이동에만 가능, 새로고침 시 사라짐
- B) `localStorage` — 영구 저장, 새로고침 견고, 다탭 동시성 X
- C) Zustand store — React 안에서만 사용, persist 미들웨어 추가 필요

**결정:** B 채택 (`localStorage.setItem('mello:welcome-pending', '1')`).

근거:
- 새로고침 시 모달이 사라지지 않는 일관성 (A 기각)
- 의존성 추가 없이 즉시 가능 (C 기각, MVP 범위)
- 다탭 동시성은 MVP 허용 범위 (희귀 케이스)

가드 패턴: PostListPage 마운트 시 `getItem` → `setState(true)` → `removeItem` 순서. read를 먼저 하지 않으면 키가 사라진 뒤라 모달 안 뜸.

---

## 3. shadcn Dialog 미사용 — 직접 fixed overlay 구현

**문제:**
모달 컴포넌트를 만들 때 shadcn-ui Dialog를 추가 설치할지 직접 구현할지 결정이 필요했습니다.

**검토한 선택지:**
- A) shadcn Dialog 추가 설치 — 표준 패턴, a11y 자동
- B) 직접 fixed overlay — 의존성 0, ARIA 직접 부여

**결정:** B 채택.

근거:
- 메모리 `feedback_dependency_blast_radius.md` 정합 — 보조 기능(모달 1개)을 위해 의존성 추가 회피
- 환영 모달 1회용이라 재사용 가치 낮음. 다른 dialog가 추가될 때 재평가
- ARIA 3속성(`role="dialog" aria-modal="true" aria-labelledby="..."`) 직접 부여로 a11y 충족 확인

한계점: 외부 클릭/ESC로 닫기는 미구현 (시안에 X 버튼 없음 + 명시 두 버튼만 액션). 추후 다른 모달 추가 시 hook으로 추출 후 통합 가능.

---
