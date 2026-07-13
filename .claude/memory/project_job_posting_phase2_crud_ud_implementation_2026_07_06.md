---
name: project_job_posting_phase2_crud_ud_implementation_2026_07_06
description: "구인공고 Phase 2 수정·삭제(U/D) 구현 박제 — 인지부채 HIGH, 전량 AI 생성, 리뷰 미열람 (2026-07-06)"
metadata: 
  node_type: memory
  type: project
  originSessionId: d9b21128-1913-41a0-a47a-3d362807ad23
---

구인공고 Phase 2 **수정(Update)·삭제(Delete)** 기능. **전량 AI 생성 → 인지부채 HIGH, 본인 미열람.** 사용자 지시로 리뷰를 인지부채로 플래그하고 develop 선머지(속도 우선). PR **#32 develop 머지**(`075897b`), 브랜치 `feat/job-posting-phase2-crud`(base develop, gh 자동삭제). tsc/eslint/build 3게이트 green(2026-07-06). MSW 목만. 다음 만지기 전 아래 메커니즘 재구성 + 자기점검 통과할 것. [[feedback_ai_written_code_cognitive_debt]] [[feedback_selfqa_merge_gate]] [[project_job_posting_phase2_create_implementation_2026_07_03]]

## ⚠️ 리뷰 1순위 = `useJobPostMutations`
계획서(`docs/superpowers/plans/2026-06-26-job-posting-phase2-crud.md`)상 이 훅은 **"본인작성 권장"**(캐시 무효화 = 새 판단 로직)이었으나 이번엔 AI가 씀. 리뷰 시 **여기부터** 보고 "왜 이렇게"를 재구성할 것.

## 범위·경계
- **수정 + 삭제만.** 마감(close)은 스코프 밖(사용자 지시). `JobPostActions`에 close 버튼 자리만 주석으로 남김 — 추후 `canClose` 게이트 + close mutation 붙이면 됨.
- MSW 목 동작. BE PATCH/DELETE는 staging·prod 배포 확인됨(07-04)이나 **실통신 미검증** — 어댑터(`api/jobPosts.ts`) 격리. [[feedback_fe_ahead_of_backend_strategy]]

## 메커니즘 (10)
1. **폼 리팩터 = API 호출을 폼 밖으로** — 기존 `JobPostForm`은 내부에서 `createJobPost` 직접 호출했음. create/edit 공용화 위해 폼은 payload만 만들고 `onSubmit(payload)` 콜백으로 위임. mutation + navigate는 컨테이너(Create/Edit 페이지) 책임. **create 경로 보존됨**(JobPostCreatePage가 create.mutateAsync 후 navigate).
2. **`useJobPostMutations` 캐시 무효화 3분기** — create→`['job-posts']` invalidate. update→`['job-posts']` + `['job-post',id]` invalidate. delete→`['job-posts']` invalidate + `['job-post',id]` **removeQueries**(invalidate 아님).
3. **삭제만 remove인 이유** — 삭제된 상세를 invalidate하면 재조회→404. 그래서 재요청 대신 캐시에서 제거(removeQueries).
4. **`jobPostToFormValues`(utils) prefill** — 상세→폼 값. **상시모집이면 alwaysRecruiting=true 켜고 deadlineDate는 빈 문자열**(체크박스가 sentinel 담당, 저장된 `9999-12-31`을 date input에 안 넣으려는 것). null 선택필드는 ''로.
5. **`JobPostActions` canEdit 게이트** — `if (!job.canEdit) return null`. 수정·삭제 **둘 다 canEdit로 분기**(별도 canDelete 없음). BE 미배포/권한없음 구간엔 응답에 canEdit 없어 버튼 미노출(안전).
6. **삭제 = 인라인 2단계 확인** — window.confirm 대신 `confirming` state로 버튼→"삭제/취소" 전환. `remove.isPending`으로 중복클릭 방어.
7. **MSW PATCH = 파생필드 재계산** — body로 title/label/dday 다시 계산, 기존 항목 spread로 id/status/authorNickname/canEdit 보존 후 교체(`mockJobPosts[idx] = updated`). DELETE = `splice` + 204 빈 바디.
8. **react-refresh 함정** — `JobPostFormValues` 타입 + `jobPostToFormValues` 함수를 처음엔 JobPostForm.tsx에서 export → eslint `react-refresh/only-export-components` 에러(컴포넌트 파일은 컴포넌트만 export). → **utils/jobPost.ts로 이동**(isAlwaysOpen 옆). 폼은 타입만 import.
9. **타입** — `JobPostUpdatePayload = JobPostCreatePayload` alias(BE상 동일 필드, drift 방지). `JobPostDetail.canEdit?: boolean` optional 추가.
10. **라우트** — `/job-posts/:jobPostId/edit`(AuthRoute 안, 로그인 필요). react-router v7 specificity라 `:jobPostId`와 순서 무관. 진입점은 상세 액션바뿐(canEdit 게이트), 별도 버튼 없음.

## 추가 — 작성 진입버튼 게이트 + FAB (PR #33·#34·#37, AI 생성)
- **최종 = 콘텐츠 열 우측 하단 고정 확장형 FAB** — `[＋ 구인공고 작성]` 알약. 디자인 여러 번 반복(인라인 상단→원형FAB→확장FAB→in-flow→롤백→칼럼정렬FAB, PR #33~#37). 최종 `d3c6faf`.
  - **칼럼 정렬 기법**: 뷰포트 오른쪽 끝이 아니라 콘텐츠 열에 붙이려고, 콘텐츠와 동일 래퍼로 감쌈 — `fixed inset-x-0 md:mx-20`(main 여백) → `mx-auto max-w-3xl`(PostListPage 칼럼 폭) → `justify-end`. 스트립 `pointer-events-none` + 버튼만 `pointer-events-auto`(뒤 콘텐츠 클릭 보존). 모바일 `bottom-20`(BottomNav 위)/데스크탑 `md:bottom-8`.
- **canWrite 게이트** — 최초 `role THERAPIST||ADMIN`(인증 치료사만)로 시작했으나 **당일 결정 변경 → 로그인 전체 유저(USER/THERAPIST/ADMIN)로 확대**(PR #38 `9bfe088`→prod `089b6e7`). 현재 `canWrite = role USER||THERAPIST||ADMIN` = 비로그인만 미노출. FAB(JobPostFeed) + 라우트가드(JobPostCreatePage) 양쪽 동일. 최종 권한은 BE POST 소유(현재 BE role 가드 없음=보류).
- **JobPostCreatePage 라우트 가드** — 같은 canWrite로 `if(!canWrite) return <Navigate to="/posts?tab=jobs" replace/>`. 버튼 숨김 + URL직접진입 방어 이중. 최종 권한은 BE POST 소유(MSW 정책 시뮬).
- canWrite 판정이 JobPostFeed·JobPostCreatePage 2곳 인라인 중복 — 추후 헬퍼 추출 여지(현재 ProfilePage도 인라인이라 컨벤션 따름).

## 알려진 한계
- 실 BE PATCH/DELETE 미검증. 응답 shape·canEdit 파생은 BE 소유라 MSW 근사와 다를 수 있음.
- 마감(close) 없음. 작성 진입버튼·ADMIN 게이트 없음(create와 동일).
- 삭제 후 navigate('/posts?tab=jobs')로 목록 복귀 — 상세 언마운트 직전 removeQueries race는 무해.

## 자기점검 6
1. 삭제 성공 후 상세 캐시를 invalidate 안 하고 removeQueries 하는 이유는? (재조회 시 404)
2. 폼에서 API 호출을 왜 밖으로 뺐나? create는 여전히 어떻게 도나? (onSubmit 위임, 컨테이너가 mutation+navigate)
3. 상시모집 공고를 수정 화면에서 열면 마감일 칸이 왜 비어 있나? (jobPostToFormValues가 sentinel 안 넣음)
4. 수정/삭제 버튼이 안 보인다 — 어디부터? (job.canEdit falsy → JobPostActions null)
5. `jobPostToFormValues`를 왜 JobPostForm.tsx가 아니라 utils에 뒀나? (react-refresh/only-export-components)
6. 이걸 prod에 올리려면 뭐가 선행? (BE 실통신 PATCH/DELETE 검증 + canEdit 내려주는지 + MSW OFF 동작)
