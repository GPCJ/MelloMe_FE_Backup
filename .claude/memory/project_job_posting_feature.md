---
name: project_job_posting_feature
description: "구인공고 신기능 — PM 기획 단계, FE는 카드 피드형(A)으로 기움(미확정)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 00d8fe15-1b31-4c14-82af-97abf06eb500
---

PM(영현)이 기획 중인 **치료사 구인공고** 신기능.

## ⭐⭐⭐ prod 배포 완료 (2026-07-06) — 구인공고 CRUD + FAB + 탭UI main 머지
- **`93aa46f` main push = prod 배포.** develop→main 머지로 06-30 revert(`1896774`) 이후 처음 구인공고 prod 복귀. 백업 `backup/main-pre-jobposting-2026-07-06`(@`1896774`).
- **머지 방식**: revert 때문에 modify/delete 충돌 11개 → **전부 develop 채택**(파일 복원). `git diff origin/develop HEAD` 빈 것 확인 = **prod 트리 = staging 트리 완전 일치**. tsc/build green.
- **포함**: 구인 탭/피드/상세(Phase1) + 작성/수정/삭제(Phase2) + 인증치료사 작성 FAB + 홈피드 탭 UI개선(`821c307` 상단고정·배색). staging(develop `821c307`)과 동일.
- **실 BE 검증됨**(사용자 실측): develop=MSW OFF 실 BE로 작성/수정/삭제 UI 작동 확인(canEdit 내려옴). prod도 MSW OFF 실 BE.
- **의도적 보류(사용자 결정)**: ①BE role 가드 없음(FE 클라 게이트만) ②AI 생성 코드 셀프리뷰 미완(인지부채 [[project_job_posting_phase2_crud_ud_implementation_2026_07_06]]). 둘 다 인지된 리스크로 배포 강행.
- **후속 (2026-07-06, PR #38 → prod `089b6e7`)**: 작성 게이트 **인증 치료사만 → 로그인 전체 유저(USER/THERAPIST/ADMIN)로 확대**. FAB+라우트가드 양쪽. staging `9bfe088`.
- **남은 것**: 마감(close) = 선택 기능(자동마감+삭제로 대체 가능, 안 만들기로). prod 배포 후 실동작 확인 필요(Vercel 빌드 완료 후 구인 탭/작성/수정/삭제).

## ⭐⭐ 실측 갱신 (2026-07-04) — prod BE `/job-posts` **배포 확인**, 크롤러 데이터만 남음
- prod `/v3/api-docs` 실측: `/api/v1/job-posts`(GET·POST), `/api/v1/job-posts/{id}`(GET·PATCH·DELETE), `/api/v1/job-posts/{id}/close`(PATCH) — **풀 CRUD + close 전부 배포**. staging도 동일. 스키마: `CreateJobPostRequest`·`UpdateJobPostRequest`·`JobPostDetailResponse`·`CursorPagedResponseJobPostSummaryResponse` 존재.
- prod GET 실호출: `HTTP 200`, `data.items:[]` (인증 없이 열람 가능, **크롤러 실데이터 0건**).
- **결론: 06-30의 "prod BE 엔드포인트 미배포→404" 블로커 해소.** 남은 재배포 조건은 **크롤러 실데이터 하나**. 지금 FE 재배포하면 "구인" 탭은 살지만 빈 목록. Phase2 POST도 prod 배포됐으므로 "staging BE POST 미배포→prod 금지" 제약도 해제(단, 데이터/QA 관점 판단은 별개).

## ⭐ 현황 (2026-06-30) — 방향 A 확정 + Phase1 develop(staging)만, prod 제거됨
- **방향 A(카드 피드형) 확정** — 아래 "FE 의견=A" 대로 진행됨.
- **Phase1 구현 완료, develop(staging)에만 유지** — PR #29(`feat/job-posting-phase1`) develop 머지(`124799c`). 읽기 전용: 홈피드(PostListPage) "구인" 탭 + 상세(`/job-posts/:id`). MSW 더미 기반(`VITE_MSW_ENABLED==='true'`일 때만 ON).
  - FE 파일: `api/jobPosts.ts`(`GET /job-posts`, `/job-posts/:id`)·`components/jobpost/{JobPostCard,JobPostFeed,JobStatusBadge}`·`hooks/useInfiniteJobPosts`·`types/jobPost.ts`·`constants/jobPost.ts`·`utils/jobPost.ts`·`pages/jobpost/JobPostDetailPage`·`mocks/{data,handlers}/jobPosts*`.
- **⚠️ prod 올렸다 즉시 내림 (2026-06-30)** — Phase1이 잠깐 prod 머지됐으나(`837fb54`, 팔로우 제거와 묶음), prod는 MSW OFF + **prod BE에 `/job-posts` 엔드포인트 미배포 → 구인 탭 404 에러 state(재시도 버튼)**. (`useInfiniteJobPosts.ts:44`가 404 포함 모든 에러 동일 처리, `retry:false`)
- **결정 뒤집힘 → prod에서 revert 제거 (`1896774`).** 처음엔 "FE 그대로 두고 BE에 prod 엔드포인트 merge 요청"으로 갔다가, **구인공고 전체를 prod에서 빼고 팔로우 삭제만 남기기로** 변경. revert로 jobpost 파일 11종 삭제 + PostListPage 탭 바 제거(팔로우·구인 둘 다 빠져 prod는 **탭 없는 단일 전체 피드**, 검색 무한스크롤/필터/정렬 보존). force-push 아닌 fast-forward(`837fb54..1896774`). 백업 브랜치 `backup/main-with-jobposting-2026-06-30` origin 생존.
- **다음 = 크롤러 실데이터 준비 후 prod 재배포** — 엔드포인트는 07-04 배포 확인(위 실측). 남은 조건은 크롤러 실데이터(사이트별 포맷 차이 파싱 트러블, 조치중)뿐. 채워지면 develop→main 머지로 Phase1 재투입(탭 바도 함께 복귀). 그 전까지 staging에서만 검증(prod GET은 200이나 빈 목록).
- **Phase2 작성(Create) 구현·커밋 완료 (2026-07-03)** — 브랜치 `feat/job-posting-phase2` 커밋 `7a17249`(미push 로컬 커밋, PR 생성 전 — 원격 브랜치·PR 아직 없음, 07-06 확인. 다음=push→PR→리뷰→develop 머지). **Create만**(수정/삭제/마감 제외), MSW 목만(staging BE POST 미배포 → prod 금지). 신규 `JobPostForm`·`JobPostCreatePage`(숨긴 라우트 `/job-posts/new`, 작성 버튼 미노출). staging `/v3/api-docs` 실측 계약 정합(title=BE 서버 파생이라 요청 제외, sourceUrl 필수). 인지부채 박제 [[project_job_posting_phase2_create_implementation_2026_07_03]].
- **★ deadlineDate 상시모집 BE 계약 확정 (2026-07-03)** — deadlineDate가 non-null 필수라 "마감 없음" 표현 불가 → 상시모집 = **sentinel `9999-12-31` 전송 + 요청 `alwaysRecruiting:true`**, 응답에 BE가 **`alwaysOpen` boolean 파생**. 둘 다 오면 alwaysRecruiting이 이겨 deadlineDate 무시. FE는 `alwaysOpen`으로 "상시모집" 렌더(매직 날짜 비교 회피). 06-29 계획서가 미결로 남긴 "상시모집 생성 불가"를 이 합의로 해소. GET 응답의 상시모집 wire shape(dday 값/alwaysOpen 유무)는 BE 미배포라 아직 실측 미확정.
- **Phase2 수정·삭제(U/D) 구현·머지 완료 (2026-07-06)** — PR **#32 develop 머지**(`075897b`). `useJobPostMutations`(create/update/delete 캐시무효화)·`JobPostEditPage`(`/job-posts/:id/edit`)·`JobPostActions`(canEdit 게이트, 삭제 2단계). 폼은 create/edit 공용 리팩터. **전량 AI 생성 → 인지부채 HIGH 박제** [[project_job_posting_phase2_crud_ud_implementation_2026_07_06]]. MSW 목만, 실 BE 미검증. 트리거「구인공고 수정삭제 리뷰」.
- **작성 진입버튼 = 인증 치료사 노출 (2026-07-06, PR #33 `639ac0a`)** — 결정 뒤집힘: "작성버튼 보류"→**인증 치료사(role THERAPIST/ADMIN) 자유 작성**. `JobPostFeed` 상단 "구인공고 작성" 버튼(canWrite 게이트) + `JobPostCreatePage` 라우트 가드(USER URL직접진입 리다이렉트). 게이트=ProfilePage:157 isVerified 컨벤션. AI 생성(인지부채). 상세 [[project_job_posting_phase2_crud_ud_implementation_2026_07_06]].
- **다음 = 마감(close)만 남음** — 06-29 계획서(`docs/superpowers/plans/2026-06-26-job-posting-phase2-crud.md`)의 canClose 게이트 + `/close` mutation. `JobPostActions`에 자리만 남겨둠.

---

## 기획 배경 (2026-06-09, 역사) — 두 방향 중 A 택1
아래는 방향 확정 전 기록. 같은 기능을 두 컨셉으로 그려놓은 상태였음.

## 두 방향
- **방향 A (06-05 문서) = 카드 피드형 큐레이션** — 대학/상급병원 공고를 AI가 수집·요약, 1공고=1게시글. 홈/팔로우 옆 "구인구직 피드" 탭.
- **방향 B (06-04 문서) = 지도 기반 탐색** — 현위치 중심 지도에 핀, 터치 시 바텀시트 공고 카드.

## FE 현재 의견 = A로 기움 (미확정)
**Why:**
- A는 기존 패턴 재사용(PostCard·FilterChips·피드 탭·댓글). B는 지도 SDK(카카오맵 등) 새 의존성+핀 클러스터·바텀시트·현위치 권한·좌표 데이터 → 공수 크고 리턴 의문.
- PM 본인이 B 문서에 "구직에 위치가 제1요소인가→아닌 듯"이라 적어 핵심 전제를 의심. 06-04→06-05로 A 수렴 신호.
- B는 죽이는 게 아니라 추후 "공고에서 위치 보기" 보조 기능으로 흡수 가능.

**How to apply:** PM이 방향 확정하면 이 의견 재확인만 하고 배선 시작. A 확정 전엔 코드 착수 X.

## FE 책임 범위 (A 기준)
- 만들 것: 공고 카드 UI(병원명/모집분야/고용형태/지원자격/접수기간/우대사항), 원문 아웃링크 버튼, 카드 댓글, 필터(분야/고용형태/지원자격)+정렬(마감임박·최신), 일반 회원 구인글 작성 폼, 마감 배지.
- **BE/AI 책임(대기)**: 크롤링, AI 파싱·요약·본문 생성, 마감 자동처리, 관리자 검수. → FE는 **가공된 공고 데이터를 카드로 렌더**까지. 데이터 계약(공고 JSON 스키마) BE 명세 후 배선. [[feedback_fe_ahead_of_backend_strategy]]로 뷰모델+로컬목 선행 가능.

## A 확정 시 남는 결정 (PM 확인 필요)
1. 구인구직 피드 = 별도 탭 vs 별도 라우트 (정렬·필터가 일반 피드와 달라 분기 발생)
2. 공고 카드 = PostCard 변형 vs 신규 컴포넌트 (필드 상이로 그대로 못 씀)
3. 공고 데이터 JSON 스키마 (BE/AI 출력 계약)

## 곁가지 (별개)
포인트/미션 시스템(출석·글·댓글→포인트→자료 구매) — 커뮤니티 활성화 아이디어 단계, 아직 요구사항 아님.
