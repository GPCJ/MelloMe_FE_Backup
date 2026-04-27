---
name: 프론트엔드 작업 백로그
description: 데일리 태스크 선택용 단일 참조 파일 — 할 수 있는 것 / 블로킹 대기 / 검증 방법 포함
type: project
updated: 2026-04-16
originSessionId: f733d60b-43f4-4c4c-be62-0deecb757652
---
# 프론트엔드 작업 백로그

> 상태: `[ ]` 미완 / `[x]` 완료 / `[?]` 검증 필요 / `[-]` 해소(의도적 종료)
> 블로킹 태그: `[BE]` 백엔드 / `[디자인]` 디자이너
> 검증일: 각 항목의 마지막 확인 날짜
> 상세 필요 시 → `detail/` 또는 기존 메모리 파일 링크

---

## 1. 바로 할 수 있는 것 (프론트 독립)

### 임시 조치 / 버그
- [x] **F-01** 인터셉터 로그인 401 refresh 버그 (커밋 a92320a)
- [x] **F-02** LoginPage/SignupPage catch 에러 메시지 추출 오류 (커밋 a92320a)
- [x] **F-03** MSW `FORCE_FEED_500` 토글 false 확인 (04-16 확인 완료)
  - 검증: `grep "FORCE_FEED_500" frontend/src/mocks/handlers/posts.handlers.ts` → `false` 여야 정상
- [x] **F-04** Paginated 프로퍼티 fallback 매핑 검증 (04-16 확인 완료)
  - 결과: 세 엔드포인트 모두 `items`로 통일, 프론트 타입과 일치, 배포 환경 정상 동작 확인

### 리팩토링 / 마이그레이션 (미검증)
- [x] **R-01a** ProfilePage 3탭 RQ 마이그레이션 완료 (2026-04-23, 커밋 924d55e + 0ba0523)
- [?] **R-01b** PostListPage `useInfiniteFeed` → `useInfiniteQuery` (코드 production 반영, 런타임 회귀 검증 대기)
  - 커밋: 8f0b595, cd126d6 (prerender 비활성 우회 0dcf346은 6d234cc로 해소)
  - 런타임 검증 항목 (production 사이트 직접):
    - [ ] 무한 스크롤 다음 페이지 페치
    - [ ] 게시글 클릭 → 뒤로가기 시 스크롤/필터 복원
    - [ ] 필터 칩 변경 시 깜빡임 없음
    - [ ] 에러 시 P1 fallback 전환
  - 상세: `project_rq_migration_implementation.md`
- [ ] **R-02** AbortController 일괄 적용 (PostListPage, PostDetailPage)
  - 검증: `grep "AbortController" frontend/src/pages` → 적용 여부
- [ ] **R-03** refresh plain axios 분리
  - 검증: `grep "import axios" frontend/src/api/axiosInstance.ts` → plain axios import 유무
  - 참고: F-01과 연관, 백엔드 연결 후 401 통합 테스트 시점에 처리
- [ ] **R-04** FilterChips 컴포넌트 추출 (Pagination 추출 완료, 다음 순서)
  - 검증: `grep "FilterChips" frontend/src/components` → 공통 컴포넌트 존재 여부
  - 상세: `project_search_code_review.md`
- [ ] **R-05** ProfilePage 관심사 분리 (RQ 마이그레이션 후 후속 정리)
  - 현황: 3탭 RQ 전환 후 파일 400줄+, 탭/편집/인증 로직 혼재
  - 검증: `wc -l frontend/src/pages/profile/ProfilePage.tsx` → 분리 전후 비교

### 인지부채 (코드 아닌 학습)
- [x] **L-01** `useInfiniteFeed` + P1 fallback 메커니즘 복습 (04-17 대략적 로직 + controller 이해 완료, 더 깊이 파는 것은 RQ 도입 후 불필요)
  - 상세: wiki `p1-feed-pagination-auto-fallback-high`
- [ ] **L-02** multipart/form-data 연결 과정 이해
- [ ] **L-03** 리액션 API 리팩토링 흐름 이해
- [x] **L-04** 마이페이지 3탭 데이터 흐름 이해 (04-17 완료)

### GA4 이벤트
- [x] **G-01** GA4 커스텀 이벤트 1차 4종 삽입 (2026-04-24 완료, 커밋 cf7750e)
  - `SignupPage` → `signup_completed` / `LoginPage` → `login_completed` (navigate 전) / `TherapistVerificationPage` → `verification_requested` / `PostCreatePage` → `first_post_created` (`fetchMyPosts(0,1).totalElements === 0` 프론트 단독 판별, `/me.postCount` 스펙 부재로 대체)
  - 검증: GA4 실시간 리포트에서 4종 이벤트 집계 확인 완료
- [ ] **G-02** PM 정식 스펙 주요 7개 추가 삽입 (2026-04-27 PM 스펙 도착, 즉시 착수 가능 — 프론트 독립, 백엔드 의존성 0)
  - 주요 7개: `sign_up` / `profile_edited` / `certification_started` / `certification_completed` / `post_created` / `reaction`(type param 6분기) / `screen_exit`(screen_name + duration)
  - G-01 4종과 매핑 결정 필요(리네임/유지). 상세: `project_analytics_event_spec_pm_v1.md`
  - 검증: GA4 실시간 리포트에서 7개 이벤트 + reaction type별 집계 확인
- [ ] **G-03** PM 정식 스펙 비주요 17개 점진 삽입 (G-02 안정화 후)
  - 콘텐츠/탐색/세부 인증 이벤트들. 우선순위 낮음

### SEO
- [x] **S-01** vite-prerender-plugin 빌드 hang 진단 + prerender 재도입 (2026-04-27 완료, 커밋 6d234cc)
  - 원인: React 19 + `react-dom/server` `renderToString`이 Node 이벤트 루프 잔류 핸들 남김 (preactjs/vite-prerender-plugin Issue #3, 1년+ 미해결)
  - 해결: 자체 vite 플러그인 `closeBundle` 훅에서 `process.exit(0)` 호출 + `apply: 'build'` + `enforce: 'post'`
  - 검증: 로컬 9초 종료 / Vercel 14초 배포 완료 / prerender 3개 산출물 정상
  - 상세: wiki `vite-prerender-plugin-react-19-hang` (debugging)

### 정책 페이지
- [x] **P-01** 개인정보처리방침 페이지 `/privacy` + Signup/LandingFooter/LoginPage 링크 (2026-04-24 완료)
  - 상세: `project_privacy_policy_page.md`
- [x] **P-02** 이용약관 페이지 `/terms` + SignupPage/LoginPage 이용약관 링크 연결 (2026-04-24 완료, 준비중 스텁)
  - TermsPage는 본문 없이 "준비 중" 안내만. 본문 채우는 건 후속 작업(법적 검토 이후)
  - SignupPage는 새탭, LoginPage는 same-tab 유지 (PrivacyPage 패턴 동일)

---

## 2. 블로킹 대기

### 백엔드 [BE]
- [x] **B-01** 프로필 이미지 URL localhost 버그 (P0) — 해소 2026-04-22
  - 백엔드 EC2에 `APP_BASE_URL` 주입 완료, 응답이 `https://api.melonnetherapists.com/...`로 내려옴 → 프론트 `resolveImageUrl.ts` localhost 치환 제거
  - 상세: `project_profile_image_localhost_bug.md`
- [?] **B-02** title 필드 optional 변경 (P0) — 확인일: 04-16
  - 현황: 프론트 `PostCreateRequest`에 title 없음. 백엔드가 required로 막는지 확인 필요
  - 검증: Swagger에서 POST /posts title 없이 요청 → 400 여부
- [ ] **B-03** visibility 블러 정책 변경 (P1) — 확인일: 04-16
  - 현황: 합의 완료. 당분간 제외 유지 → 백엔드 병목 해소 후 블러 방식 변경
  - 검증: Swagger에서 USER 롤로 GET /posts → PRIVATE 글 포함 여부
  - 상세: `project_visibility_response_conflict.md`
- [ ] **B-04** 팔로우 시스템 API (P1) — 확인일: 04-16
  - 현황: 미구현
  - 검증: Swagger에서 `/follow` 엔드포인트 존재 여부
- [?] **B-05** 스크랩 `scrapped` 필드 초기값 연동 (P1) — 확인일: 04-16
  - 현황: 합의 완료 + 구현 가능성. 프론트는 `useState(false)` 고정 중
  - 검증: DevTools → GET /posts 응답에서 `scrapped` 값 확인 → 있으면 `useState(post.scrapped)` 교체
- [ ] **B-06** 환영 페이지 isNewUser 하드코딩 — 확인일: 04-16
  - 현황: 백엔드 isNewUser 값 정상 여부 미확인
  - 검증: DevTools → 로그인 응답 `isNewUser` 값이 실제 상태와 일치하는지
- [ ] **B-07** 게시글 이미지 presigned URL 대응 (P1) — 확인일: 04-22
  - 현황: 백엔드가 presigned URL 방식으로 결정, 작업 대기
  - 검증: Swagger `/v3/api-docs` 재조회 → `PostImageResponse.imageUrl`이 서명 쿼리 포함 절대 URL인지
  - 상세: `project_post_image_presigned_url.md`
- [-] ~~**B-08** 유저 행동 분석용 `analyticsId` 필드 추가~~ → **드롭 (2026-04-24)** PM 결정: GA4 유저 단위 추적 안 함, Looker Studio/Firebase 로우데이터로 대체. 이벤트 4종은 프론트 독립 착수로 이동.

### 해소됨
- [-] ~~탈퇴 유저 에러코드 분리~~ → 비번 틀림과 동일 에러 유지 확정 (04-16)
- [x] ~~이미지 public + 절대 경로~~ → 해결됨 (04-16)

### PM / 운영
- [ ] **PM-01** 개인정보처리방침 법적 검토 → 통과 시 `PrivacyPage.tsx` 상단 초안 배너 제거 + 시행일 갱신
  - 검증: `grep "검토 중인 초안" frontend/src/pages/PrivacyPage.tsx` → 제거 여부
- [ ] **PM-02** 개인정보 보호책임자 연락처 확정 → `melonnebuilders@gmail.com` 플레이스홀더 교체

### 디자이너 [디자인]
- [ ] **D-01** 정렬 토글 UI (LATEST/POPULAR) 시안
- [ ] **D-02** fallback 안내 메시지 문구 확인
- [ ] **D-03** 모바일/PC 상단 헤더 별도 디자인 — 상세: `project_mobile_header_refactor.md`
- [ ] **D-04** 첨부파일 UI 위치/디자인 (PostDetailPage)
- [ ] **D-05** 치료영역 배지 디자인 (인증 치료사 닉네임 옆) — 백엔드 완료
- [ ] **D-06** 3종 리액션 UI 디자인 (좋아요·공감·도움) — 백엔드 완료
- [ ] **D-07** 블러 UI 디자인 (미인증 회원 열람 시)
- [ ] **D-08** 팔로우/언팔로우 버튼 위치/디자인
- [ ] **D-09** 데스크탑 헤더 글쓰기 버튼
- [ ] **D-10** VerificationCompletePage PENDING/APPROVED 화면 디자인
- [ ] **D-11** 치료사 인증 상세 정보 UI 디자인

---

## 3. UI만 존재 (기능 미동작, 낮은 우선순위)

- **U-01** 로그인 상태 유지 체크박스 (`/login`)
- **U-02** 비밀번호 찾기 링크 (`/login`)
- **U-03** 이용약관/개인정보처리방침 링크 (`/login`)
- **U-04** 검색바 (`/posts`) — 백엔드 검색 API 필요
- **U-05** 배너 통계 하드코딩 (`/posts`)
- **U-06** 공지사항 드롭다운 mock (네비게이션 바)

---

## 완료 아카이브

- [x] Pagination 컴포넌트 추출 (커밋 32ac85a)
- [x] MobilePageHeader 추출 (커밋 c336ca0)
- [x] 무한 스크롤 main 머지 (커밋 7d2803e)
- [x] P0 필터 칩 feed 중복 요청 버그 (커밋 d776f85)
- [x] P1 feed→pagination fallback (커밋 f4a50cc)
- [x] U-07 공개/비공개 토글 API 연동 — PostCreatePage/PostEditPage에서 `visibility: PUBLIC|PRIVATE` 이미 전송 중 (04-17 재확인)

---

## 운영 규칙

1. **세션 시작**: 이 파일 읽기 → 오늘 할 항목 선택 → 해당 항목 검증 grep 실행
2. **작업 완료 시**: 체크박스 업데이트 + 확인일 갱신
3. **새 이슈 발견 시**: 적절한 섹션에 넘버링 추가
4. **주 1회**: 블로킹 대기 섹션 전체 확인일 갱신
