---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /post-notion-draft로 업로드 가능.
type: draft
updated: 2026-05-19
originSessionId: current
---

# 2026-05-14 ~ 19 MVP 발표 전후 작업 정리

> 마지막 노션 기록일(5/13) 이후, MVP 발표일(5/15) 전후로 진행한 팀 프로젝트 영향 작업.
> TIL은 별건 없음(SEO 학습은 wiki에 기록, 노션 TIL은 보류). SEO 발췌 트러블슈팅도 보류(미해결).

---

## 🔧 트러블슈팅 — #NNN 게시글 삭제/수정 후 목록 stale 캐시

> **번호 NNN**: 노션의 트러블슈팅 페이지 마지막 번호 + 1로 부여 필요

**날짜**: 2026-05-18
**분류**: React Query 캐시 / 상태 동기화
**난이도**: 중

### 문제 상황

게시글 상세에서 삭제하거나 편집을 마치고 `/posts` 목록으로 돌아왔을 때, 방금 삭제한 글이 계속 보이거나 수정 전 본문/제목이 그대로 노출되는 현상이 있었습니다. 새로고침하면 정상이지만, SPA 내부 네비게이션만 한 사용자는 본인 작업이 반영 안 된 것처럼 보이는 문제입니다.

### 원인 분석

`/posts` 목록은 `['feed']` 키로 React Query에 캐시되어 있는데, 삭제 핸들러(`PostDetailPage`)와 수정 핸들러(`PostEditPage`)가 mutation 성공 후 캐시를 무효화하지 않고 navigate만 호출하고 있었습니다. RQ는 stale 캐시를 즉시 화면에 보여주고 백그라운드에서 refetch를 돌리는데, refetch가 끝나기 전에 사용자가 stale 데이터를 보는 시점이 생긴 것입니다.

같은 패턴이 이전에도 있었습니다(프로필 편집 후 마이페이지 캐시 무효화 — `ee07728`). 즉 "mutation 후 관련 캐시 무효화"가 이 코드베이스에서 반복되는 누락 포인트라는 게 드러난 셈입니다.

### 해결 과정

두 핸들러 모두 `qc.invalidateQueries({ queryKey: ['feed'] })` 한 줄 추가했습니다.

```ts
// PostDetailPage.tsx — 삭제 핸들러
await deletePost(post.id);
qc.invalidateQueries({ queryKey: ['feed'] });
navigate('/posts');

// PostEditPage.tsx — 수정 핸들러
// (첨부파일 처리 후, navigate 직전 배치)
qc.invalidateQueries({ queryKey: ['feed'] });
navigate(`/posts/${postId}`);
```

`PostEditPage`에서는 invalidate 위치가 중요했습니다. 첨부파일 추가/삭제 API가 mutation 뒤에 순차 실행되기 때문에, 첨부 처리 도중 무효화하면 refetch가 첨부 처리가 안 끝난 상태의 응답을 받을 수 있습니다. 그래서 모든 첨부 처리 완료 → invalidate → navigate 순서로 박았습니다.

추가로 디버깅 보조용으로 `@tanstack/react-query-devtools`를 설치하고 `main.tsx`에 마운트했습니다. 좌하단 토글로 모든 쿼리 키와 캐시 상태를 시각적으로 볼 수 있어, 앞으로 비슷한 캐시 누락 진단이 빨라질 것으로 기대합니다.

커밋: `d498adf`

### 핵심 개념

- **`invalidateQueries`는 즉시 refetch가 아님**: 해당 쿼리 키를 "stale로 표시"하고, 활성 옵저버가 있으면 refetch를 트리거. 옵저버가 없으면 다음 mount 시 refetch.
- **mutation 핸들러 마지막에 무효화 배치**: 첨부 처리 같은 후속 API가 있으면 무효화는 모든 후속 작업 완료 후로 미뤄야 stale-while-revalidate 윈도우가 짧아짐.
- **devtools는 캐시 키 누락 진단의 핵심 도구**: 어느 쿼리가 어느 시점에 stale/fetching/fresh 상태인지 시각화. 프로덕션 번들엔 미포함.

### 면접 포인트

- "RQ에서 mutation 후 캐시 무효화를 어디 어떻게 박는가" — 핸들러 마지막, navigate 직전, 후속 작업 완료 후.
- "왜 navigate 후가 아니라 직전인가" — navigate가 컴포넌트 unmount + 새 페이지 mount를 일으키는데, 새 페이지의 query observer가 stale 상태를 본 시점에 refetch를 트리거하도록 invalidate가 navigate 전에 끝나야 함.
- "같은 누락 패턴이 반복되면 추상화 검토" — 현재는 호출처 2곳이라 직접 호출 유지. 호출처가 4곳 이상으로 늘면 `useInvalidateFeed()` 같은 훅으로 추출 고려.

---

## 🏗 설계 결정 & 아키텍처 — 2026-05-14 ~ 15 브랜드/SEO 일괄 정비

### 1. 브랜드 표기 Mellti 단일화

**문제**: 코드베이스에 `멜로미`, `Mellti`, `mellty`, `멜티` 4종 표기가 혼재. prerender 메타, 환영 모달, 헤더/푸터, 아이콘 주석까지 16개 파일에 흩어져 있었습니다. SEO 키워드 매칭은 브랜드 표기가 일관돼야 검색 트래픽이 한 곳으로 모입니다 — 표기 분산은 색인 분산과 같습니다.

**검토한 선택지**:
- A. `Mellti`로 일괄 통일 — SEO 매칭 일관성 확보. 단점: 한 번에 16파일 수정(blast radius).
- B. 사용자 노출 텍스트만 통일, 주석/내부 변수는 그대로 — 비용 낮음. 단점: grep 시 혼란 유지, 신규 작업자 컨벤션 모호.
- C. 표기는 그대로 두고 alias 도입 — 비용 0. 단점: 검색엔진은 alias 안 봄, 의미 없음.

**결정**: **A 채택**. MVP 발표(5/15) 전 마지막 정리 타이밍에 일괄 처리. SEO 색인 갱신과 동시에 표기 일관성도 같이 박힙니다.

근거:
- 사용자 노출 텍스트 + 내부 주석/변수까지 통일하면 grep 결과가 명확해져 향후 작업자 인지부채 감소
- prerender 메타가 검색 결과에 그대로 노출되는데 거기만 통일하면 색인은 일관해도 코드는 혼란 — 한 번에 처리하는 게 깔끔
- blast radius는 큰 편이지만 모두 문자열 치환이라 회귀 위험 낮음(빌드 통과 + prerender 시각 확인)

커밋: `7c391f0` (16파일)

---

### 2. PM SEO 키워드 적용 — 옵션 A + B 병행

**문제**: PM이 정리한 SEO 키워드 카탈로그(핵심5 + 영역10 + 정보성11, 총 26종)를 검색엔진에 어떻게 노출할 것인가. `/` prerender의 description meta만으로는 부족 가능성 — 실제로 Googlebot이 `/signup` 본문을 description 후보로 우선 채택하는 현상 확인(5/15 스크린샷).

**검토한 선택지**:
- A. `/` description meta에 핵심 키워드 압축 반영 — 1차 조치, 비용 최소.
- B. `/` prerender HTML 본문에 sr-only 자연어 2문단으로 영역10·정보성11·핵심5 키워드 박기 — 본문 시그널 강화, UX 영향 0.
- C. 랜딩페이지 부활(폐기 결정 뒤집기) — 가장 근본. 하지만 시안 + PM 결정 + 로그인 분기 재설계 필요, MVP 후 처리.

**결정**: **A + B 병행 채택, C는 MVP 후 평가**.

근거:
- 옵션 A 단독으로는 description meta는 박혀도 봇이 본문 자동 추출 시 `/signup` hydrate 결과를 우선할 가능성 → B로 보강 필요
- 옵션 B는 `EmptyRoot`를 `SeoRoot`로 교체하고 `sr-only` div에 자연어 2문단 추가. hydrate 직후 `RootRedirect`는 그대로 동작 → 사용자 화면 영향 0
- 옵션 C는 랜딩 폐기 결정(2026-05-06, `project_landing_page_deprecation`) 뒤집기라 blast radius 큼. MVP D-day 직전 회피

커밋: `774f43e`(옵션 A), `caa98f3`(옵션 B)

**한계점 (박제)**:
- sr-only 본문도 hydrate 후 React가 다시 렌더링하면 사라짐 — 봇이 본 final DOM이 우선이라는 구조적 문제는 여전
- 즉 옵션 A + B는 description meta 정상 노출은 보장하지만, Googlebot의 본문 자동 추출까지는 강제할 수 없음
- `Mellti` 단일 검색에서 description이 회원가입 폼 본문으로 잡히는 현상은 옵션 E(시간 두고 색인 캐시 갱신 대기)로 단기 처리. backlog `S-03`에 모니터링 트리거(2026-05-22~) 박제
- 구조적 해결은 옵션 C(랜딩 부활) 또는 `/`에 BottomNav/SideNav 같은 visible 본문 격상 — MVP 후 SEO 고도화 의사결정 시점에 재개

---

### 3. Naver Search Advisor 등록 (non-www + www 모두)

**문제**: 한국 사용자 비중 높은 서비스라 네이버 검색 색인이 필수. 사이트 소유 확인 방식 결정 필요.

**검토한 선택지**:
- A. HTML 파일 업로드 방식 — 파일을 정적 자산으로 배포. 단점: SPA 라우팅과 충돌 가능.
- B. `<meta>` 태그 방식 — `index.html`에 verification token 박기. 단점: 토큰 노출(공개정보라 문제 없음).
- C. DNS TXT 방식 — DNS 설정 변경. 단점: 도메인 관리 권한 + 전파 시간.

**결정**: **B 채택**. `index.html`에 `<meta name="naver-site-verification">` 박기. non-www + www 도메인 둘 다 처리.

근거:
- non-www는 Vercel이 308로 www에 redirect하지만, Naver는 양쪽 도메인 별도 등록 권장 — 둘 다 박음
- 토큰 2개를 `index.html`에 나란히 박고, 삭제 사고 방지용 한국어 주석 동반("삭제 시 콘솔 연결 해제됨")
- 등록 후 sitemap.xml 제출 + 웹페이지 수집 요청까지 이어서 진행

커밋: `a232f6a`(non-www), `82d3196`(www)

---

## 📈 프로젝트 성과 & 지표 — 2026-05-14 ~ 19

### MVP 발표 직전 안정화 (2026-05-14)

- **브랜드 표기 단일화**: `멜로미/Mellti/mellty/멜티` 4종 혼재 → `Mellti` 통일(16파일, `7c391f0`). SEO 매칭 일관성 + 코드 인지부채 감소
- **stale 문서 일괄 정리**: outdated README/도큐먼트 정비, 백업 레포 README 추가, 임시 파일(test.pdf, tmp3.png) 삭제 — 신규 작업자 진입 비용 감소
- **알림 후속 수정 머지**: `fix/notification-review-followup` 브랜치 main 머지(`aaefd01`) — Swagger 정합 + store/페이지 분리 버그 fix

### SEO 인프라 구축 (2026-05-15)

- **PM SEO 키워드 26종 노출**: `/` prerender의 title/description meta(옵션 A) + sr-only 본문 2문단(옵션 B)에 핵심5·영역10·정보성11 키워드 박힙니다. 검색엔진이 본 description은 회원가입 폼 본문 → PM 의도 description으로 점진 전환 진행 중
- **Naver Search Advisor 등록 완료**: non-www + www 도메인 양쪽 verification 통과, sitemap.xml 제출 + 웹페이지 수집 요청 완료. 등록 token 2종 `index.html`에 박힙니다
- **Google Search Console 색인 재요청 완료**: 새 description 색인 반영 시작, 일반 모드 검색에서는 의도된 description 노출 확인
- **부분 미해결 박제**: `Mellti` 단일 검색 시 description이 회원가입 폼 본문으로 잡히는 현상(2026-05-15 스크린샷). 구조적 원인(SPA hydrate 후 `/signup` final DOM 발췌) 분석 완료, backlog `S-03` 모니터링 트리거(2026-05-22~) 박음. 옵션 E(대기) 단기 채택

### 게시글 mutation UX 안전성 강화 (2026-05-18)

- **삭제/수정 후 목록 stale 캐시 fix**(`d498adf`): `PostDetailPage` 삭제 + `PostEditPage` 수정 핸들러에 `invalidateQueries(['feed'])` 추가. SPA 내부 네비게이션에서 본인 작업이 즉시 반영되어 보이도록 함 — 사용자 신뢰도 직결
- **React Query Devtools 도입**: `main.tsx`에 마운트, 좌하단 토글. 캐시 상태/쿼리 키/refetch 시점 시각화로 향후 RQ 관련 회귀 진단 시간 단축. 프로덕션 번들 미포함

### 이력서 어필 bullet 예시

- "MVP 발표 D-3 ~ D+4 구간에서 SEO 인프라(Google/Naver 색인, prerender PM 키워드 26종) 일괄 구축 + 브랜드 표기 4종 → 단일화로 검색 색인 일관성 확보"
- "React Query 캐시 무효화 누락으로 발생한 게시글 mutation UX 회귀(삭제/수정 후 목록 stale)를 mutation 핸들러 패턴 정비 + devtools 도입으로 해소, 후속 회귀 진단 비용도 동시 절감"
- "SEO description 자동 추출 이슈에 대해 옵션 4종 trade-off 평가 후 MVP D-3 blast radius를 고려해 의식적 보류(옵션 E) 결정 + backlog 재개 트리거 박제"
- "백엔드 줄바꿈 stripping 이슈에 대해 Jira Task 머지를 기다리지 않고 MSW handler에서 보존 응답을 시뮬레이션해 프론트 작업(피드 더보기 인라인 펼침)을 unblock — 백엔드 머지 후 mock도 자연 환원"

---

## 💡 TIL — 2026-05-19 useLayoutEffect로 DOM 측정 + ResizeObserver 재측정 패턴

**분류**: React 훅 / 레이아웃 측정

### 오늘 한 것

피드 카드 본문이 `line-clamp-3`에 잘릴 때만 "더 보기" 버튼을 노출하는 X 스타일 인라인 펼침을 구현했습니다. 핵심은 "잘렸는지 여부"를 정확하게 판정하는 것입니다. CSS는 잘려 보이게만 해주지 "잘렸다"는 사실을 JS에 알려주지 않으므로, 직접 DOM을 측정해야 합니다.

측정 로직은 `scrollHeight > clientHeight + 1`. `scrollHeight`는 내용물이 전부 펼쳐졌을 때 차지하는 높이, `clientHeight`는 컨테이너에 실제로 보이는 높이. 둘이 다르면 잘려 있다는 뜻이고, `+1`은 subpixel 반올림 오차 방어용입니다.

측정 타이밍은 `useLayoutEffect`. 그리고 폰트/이미지 로딩이나 뷰포트 변경으로 레이아웃이 바뀔 때마다 다시 측정하도록 `ResizeObserver`로 감쌌습니다.

```tsx
// (A) ref 부착한 본문 단락
const contentRef = useRef<HTMLParagraphElement>(null);
const [expanded, setExpanded] = useState(false);
const [truncated, setTruncated] = useState(false);

// (B) 축약 상태일 때만 truncated 측정
useLayoutEffect(() => {
  if (expanded) return;
  const el = contentRef.current;
  if (!el) return;
  // (C) +1: subpixel 반올림 오차 가드
  const measure = () => setTruncated(el.scrollHeight > el.clientHeight + 1);
  measure();
  // (D) 폰트/이미지 로딩·뷰포트 변경 시 재측정
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  return () => ro.disconnect();
}, [post.contentPreview, expanded]);
```

### 배운 것 / 인사이트

**`useLayoutEffect` vs `useEffect`**가 가장 기억에 남습니다.

| 항목 | `useEffect` | `useLayoutEffect` |
|---|---|---|
| 실행 타이밍 | 브라우저가 화면을 그린 **뒤** | 브라우저가 화면을 그리기 **직전**(commit 후 paint 전) |
| 동기 여부 | 비동기 (idle 시 실행) | 동기 (React가 paint를 막고 기다림) |
| 사용자에게 보이는 영향 | "1프레임 깜빡임" 가능 | 깜빡임 없음 (보이기 전에 끝남) |
| 비용 | 가벼움 | paint 차단이라 무거우면 끊김 |

`useEffect`로 측정하면 흐름이 이렇게 됩니다:

1. React가 DOM 커밋
2. 브라우저가 첫 paint — `truncated=false` 기본값 상태로 화면 노출
3. 그 후 `useEffect`가 실행되어 measure → `truncated=true`로 업데이트
4. 리렌더 후 두 번째 paint — "더 보기" 버튼이 등장

사용자 입장에서는 "더 보기"가 한 프레임 늦게 깜빡 나타나는 게 보입니다. 본문이 잘려 있는데 더보기 버튼이 늦게 뜨면, "어 잘렸나? 어 버튼 생겼네" 같은 시각적 노이즈가 됩니다.

`useLayoutEffect`는 이 흐름의 2단계 paint를 막고, measure → state update → 리렌더 → 그 다음에 paint를 합니다. 사용자는 처음부터 "더 보기"가 같이 박힌 화면을 봅니다. 깜빡임 0.

**왜 `useLayoutEffect`를 썼는가 — 정리**:
- DOM 측정 결과가 화면에 즉시 반영되어야 깜빡임이 없음
- `scrollHeight`/`clientHeight`는 브라우저가 layout을 끝낸 commit 직후에야 정확한 값. `useLayoutEffect`는 그 시점에 동기로 실행됨
- 측정 비용 자체가 가벼움(`el.scrollHeight` 한 번 읽기) → paint 차단 부담 없음. 무거운 작업이었다면 `useEffect`로 바꾸고 깜빡임을 다른 방법으로 가렸을 것

**`ResizeObserver`로 감싼 이유**:
- 초기 measure 한 번만으로는 부족. 폰트가 늦게 로드되거나 옆 이미지가 늦게 도착하면 본문의 line height/width가 바뀌어 truncated 판정이 뒤집힐 수 있음
- 뷰포트 폭이 바뀌어도(모바일 회전, 윈도우 리사이즈) line-clamp-3 결과가 달라짐
- `ro.disconnect()`를 cleanup에 박아야 메모리/이벤트 누수 없음

**의존성 배열의 의미**:
- `[post.contentPreview, expanded]`: 본문이 바뀌면 측정 다시. expanded 상태가 바뀌면 측정 다시(축약→펼침은 측정 불필요, 펼침→축약은 다시 필요)
- `if (expanded) return`: 펼침 상태면 측정 자체를 스킵 → 펼친 상태의 scrollHeight=clientHeight라 truncated=false로 잘못 잡힐 위험 차단

### 포트폴리오 어필 포인트

- "CSS `line-clamp`로 잘리는 본문에서 '더 보기' 버튼 노출 여부를 정확히 판정"이라는 흔한 문제를 한 번에 갈피 잡고 푸는 흐름. `useEffect`로 만들고 깜빡임을 발견 → `useLayoutEffect`로 전환은 React 훅의 차이를 이해해야 가능
- `ResizeObserver`로 폰트/이미지 로딩·뷰포트 변경까지 커버 → 단순 측정이 아니라 "측정 결과를 stale하지 않게 유지하는 메커니즘" 설계
- 비용 trade-off까지 설명 가능 — `useLayoutEffect`는 paint 차단이라 무거우면 끊김. 이 경우는 측정 한 번이라 가벼움. 무거웠다면 다른 전략(`useEffect` + 깜빡임 가림용 placeholder 등)을 골랐을 것

---

## 🔧 트러블슈팅 — #NNN+1 백엔드 줄바꿈 stripping을 MSW 선조치로 unblock

**날짜**: 2026-05-19
**분류**: MSW / 백엔드 정책 시뮬레이션 / UX 회귀 방어
**난이도**: 중

### 문제 상황

피드 카드 본문(`contentPreview`)에 "더 보기" 인라인 펼침을 도입하려는데, 검증 단계에서 두 가지가 동시에 막혔습니다.

1. **백엔드 응답의 `contentPreview`에 `\n`이 strip되어 있음**: 작성 시점에 사용자가 친 줄바꿈이 응답에서는 사라져 한 줄로 옴. 줄바꿈 정책(`whitespace-pre-wrap`)은 5/2에 표시단을 정비했지만 `contentPreview` 필드는 별도 sanitize 경로를 타는 것으로 추정. Jira에 백엔드 Task로 박혀 있고 머지 대기 중.
2. **mock 데이터도 한 줄**: `mockFeedItems`의 `contentPreview`가 `"[목업 ${id}] 무한 스크롤 검증용 게시글입니다. 스크롤하면..."` 한 줄짜리라 line-clamp-3에 잘릴 일이 없음 → "더 보기" 버튼 동작 자체를 검증 못 함.

즉 백엔드 머지를 기다리면 프론트 작업(더보기 펼침)도 같이 멈추는 구조였습니다.

### 원인 분석

이 코드베이스에 이미 박혀 있는 정책: **"MSW 핸들러는 단순 fixture가 아니라 백엔드 정책의 시뮬레이션"** (메모리 `feedback_msw_simulates_backend_policy`). 이전엔 USER 롤 `visibility=PRIVATE` 차단 같은 거부 정책 시뮬레이션 사례가 있었습니다.

이번 케이스는 거부가 아니라 **"백엔드가 곧 fix할 예정인 응답 shape"을 mock이 미리 가정**하는 변형입니다. 머지 전까지 mock이 미래의 백엔드를 흉내내면, 프론트는 머지를 기다리지 않고 작업 가능.

### 해결 과정

1. **mock 데이터 멀티라인 보강** — `mockFeedItems`의 `contentPreview`에 `\n\n` 박은 6줄짜리 markdown-ish 본문으로 교체. line-clamp-3 발동 + "더 보기" 펼침까지 시각적으로 검증 가능.

2. **목록 응답 mock의 필드 매핑 변경** — `GET /posts` 응답에서 `contentPreview: p.contentPreview` → `contentPreview: p.content`로 교체. mock 데이터엔 `content`(원본 본문, `\n` 보존)와 `contentPreview`(요약, `\n` strip)가 따로 있는데, 백엔드 fix 후엔 `contentPreview`도 `\n` 보존된 채로 올 예정이므로 미리 `content`로 가정.

3. **백엔드 머지 후 환원 동선 박제** — 핸들러 주석에 *"백엔드 fix(Jira: contentPreview에 \n 보존) 시뮬레이션 — 머지 후엔 `p.contentPreview`로 환원 가능"* 한 줄. 다음 작업자가 환원 시점에 헤매지 않게.

```ts
// posts.handlers.ts (mockFeedItems)
// 백엔드 contentPreview에 \n 보존되는 형태(Jira 백엔드 Task 머지 후)를 가정한 mock.
// 더보기 인라인 펼침(line-clamp-3 이상 시 노출) 검증용으로 길이/줄수 충분히.
contentPreview: `[목업 ${id}] 무한 스크롤 검증용 게시글입니다.\n\n스크롤하면 다음 페이지가 자동으로 로드됩니다.\n\n- 항목 A: 첫 번째 줄\n- 항목 B: 두 번째 줄\n- 항목 C: 세 번째 줄\n\n자세한 내용은 본문에서 확인해주세요.`,

// posts.handlers.ts (GET /posts 응답 매핑)
// 백엔드 fix(Jira: contentPreview에 \n 보존) 시뮬레이션 — 머지 후엔 p.contentPreview로 환원 가능.
contentPreview: blurred ? '' : p.content,
```

추가로 **공백 없는 단일 토큰 침범 버그**도 같이 잡았습니다. `@`이 100개 같은 본문이 들어오면 `whitespace-pre-wrap`만으론 카드 폭을 침범. 표시단에 `break-words` 클래스 + 전역 `.post-content`에 `overflow-wrap: anywhere` 추가로 차단.

커밋: `2d854a8`

### 핵심 개념

- **MSW handler = 정책 시뮬레이션 레이어**: 단순 fixture가 아니라 백엔드의 거부/포맷/지연을 흉내내는 곳. 프론트 회귀를 mock 단계에서 발견 가능.
- **백엔드 머지 전 "미래 응답 가정 mock"**: 백엔드와 동기 신호가 명확하면(여기선 Jira Task) mock이 미래를 흉내내 프론트 작업 unblock 가능. 단, 환원 동선(주석)을 박제해야 stale mock 위험 없음.
- **`break-words` vs `whitespace-pre-wrap`**: 둘은 직교. `whitespace-pre-wrap`은 사용자가 친 `\n`/연속 공백 보존. `break-words` (= `overflow-wrap: break-word`)는 공백 없는 긴 토큰을 강제 줄바꿈. 본문 표시는 보통 둘 다 필요.

### 면접 포인트

- "백엔드 머지를 기다리지 않고 프론트가 어떻게 unblock하는가" — MSW가 미래 응답 shape을 가정. 머지 후 환원 주석으로 stale 위험 차단.
- "MSW를 단순 fixture로 쓰지 않는 이유" — 권한 거부·응답 포맷 변경 같은 정책 변화를 mock 단계에서 시뮬레이션해야 프론트 회귀를 일찍 발견.
- "`break-words`와 `whitespace-pre-wrap`을 같이 쓰는 이유" — 한 쌍이 아니라 직교. 사용자 줄바꿈 보존(전자) + 긴 토큰 강제 줄바꿈(후자)을 둘 다 충족해야 카드 영역 침범 0.

---
