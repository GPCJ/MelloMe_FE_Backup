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

---
