---
name: project_job_posting_phase2_create_implementation_2026_07_03
description: "구인공고 Phase 2 작성(Create) 구현 박제 — 인지부채 HIGH, 다음 만지기 전 필독 (2026-07-03)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 16ae526c-c423-4b51-b754-8be354c49bde
---

구인공고 Phase 2 **작성(Create)** 기능. AI 작성분 → 인지부채 HIGH. 브랜치 `feat/job-posting-phase2`(base develop), **커밋 `7a17249`(12파일) — 미push 로컬 커밋, PR 생성 전**(원격 브랜치·PR 아직 없음, 07-06 확인). 다음 액션=push→PR 생성→리뷰→develop 머지. tsc/eslint/build green + MSW ON 브라우저 셀프QA 4항목 통과(2026-07-03). 다음 만지기 전 아래 메커니즘 재구성 + 자기점검 통과할 것. [[feedback_ai_written_code_cognitive_debt]] [[feedback_selfqa_merge_gate]]

## 범위·경계
- **Create만.** 수정/삭제/마감 제외(의도). 06-29 계획서(`docs/superpowers/plans/2026-06-26-job-posting-phase2-crud.md`)는 풀 CRUD(canEdit/canClose 권한 플래그·JobPostActions·edit page·mutation 훅)였으나, 오늘 지시("작성만 / ADMIN 게이트 보류, 이용자 소수")로 create만. 나머지는 그 계획서대로 추후 추가.
- **MSW ON 한정 검증됨.** 코드는 MSW를 모름 — `createJobPost`(`api/jobPosts.ts:30`)는 그냥 `POST /job-posts`만 쏨. MSW 스위치는 `main.tsx:14`(`VITE_MSW_ENABLED==='true'`). 어댑터 격리라 MSW OFF 전환 시 함수 수정 불필요(의도). [[feedback_fe_ahead_of_backend_strategy]]
  - **⚠️ stale 정정(2026-07-06):** 박제 원문 "staging POST 미배포→MSW OFF면 404, prod 금지"는 **07-04 실측으로 깨짐** — staging·prod 둘 다 `POST /job-posts` **배포 확인**됨([[project_job_posting_feature]]). 따라서 진짜 리스크는 "엔드포인트 없음(404)"이 아니라 **①실 BE 상대 미검증 ②응답 shape(title 파생·`alwaysOpen`)은 BE 소유라 MSW 근사와 다를 수 있음**. prod 전 선행=MSW OFF 실 BE 스모크 테스트.

## 메커니즘 (10)
1. **title 요청 제외** — staging `/v3/api-docs` 실측상 `CreateJobPostRequest`에 title 없음. **BE가 서버에서 파생**(조직명+분야 등). 그래서 폼에 제목 입력칸 없음. MSW 핸들러는 `조직명 분야라벨 고용형태라벨 모집`으로 근사(실제 규칙은 BE 소유, 다를 수 있음).
2. **상시모집 = sentinel + 플래그** — deadlineDate가 non-null 필수라 "마감 없음"을 표현 못 함 → 2026-07-03 BE 합의로 상시모집 = `deadlineDate: "9999-12-31"`(`ALWAYS_OPEN_DEADLINE` 상수) + `alwaysRecruiting:true` 전송. 응답엔 BE가 `alwaysOpen` boolean 파생. 둘 다 오면 alwaysRecruiting 이김. 상세 [[project_job_posting_feature]].
3. **isAlwaysOpen 3중 폴백**(`utils/jobPost.ts`) — `alwaysOpen===true ‖ deadlineDate===sentinel ‖ dday===null`. BE alwaysOpen 미배포 구간 방어. ddayLabel/isClosed/deadlineText 모두 이걸 씀.
4. **isClosed에서 alwaysOpen 우선** — 상시모집은 dday 음수여도 절대 "마감" 아님. ddayLabel도 alwaysOpen 먼저 체크 → "상시모집" 반환.
5. **deadlineText** — 상세 마감행에 sentinel `9999-12-31` 노출 방지. 상시모집이면 "상시모집" 문자열.
6. **sourceUrl http(s) 스킴 검증**(`isHttpUrl`) — 폼에 `<form>` 없어 `type="url"` 네이티브 검증 안 돎. `example.com`(스킴 없음)은 상세 `<a href>`에서 SPA 내부 상대경로로 오인, `javascript:`는 클릭 실행. → 폼 제출 차단 + 상세 렌더 가드 **이중** 방어. (리뷰어 MEDIUM 지적 반영)
7. **MSW POST unshift** — 새 공고를 `mockJobPosts` 맨 앞(최신 상단). 목록이 id 내림차순 가정이라 unshift로 순서 유지. `computeDday`로 dday 계산(상시=null).
8. **캐시 무효화** — 작성 성공 시 `['job-posts']` invalidate(목록 stale) 후 상세로 navigate. 상세는 `['job-post', id]`로 MSW GET → unshift된 공고 조회.
9. **canSubmit TS narrowing** — `canSubmit`(const boolean) 정의를 따라 TS가 therapyArea/region/employmentType을 non-null/non-empty로 이미 narrowing. submit 경로에 추가 가드 넣으면 "no-overlap" 에러 남(실제로 겪음). sourceUrl 스킴 검증만 별도(값 형식이라 narrowing 무관).
10. **진입점 = 숨긴 라우트** — `/job-posts/new`만, 버튼 노출 X. 검증은 URL 직접 접근. ADMIN 작성 게이트 보류.

## 알려진 한계
- 실제 GET 상시모집 wire shape(dday 값? alwaysOpen 유무?) BE 미확정 → MSW로 목킹, isAlwaysOpen이 방어.
- title 파생은 BE 소유 → MSW 근사값과 실제가 다를 수 있음.
- 수정/삭제/마감·작성 진입버튼·권한 게이트 없음.

## 자기점검 5
1. 상시모집인데 "상시모집" 뱃지가 안 뜬다 — 어디부터? (isAlwaysOpen 3조건 중 무엇이 false인지: alwaysOpen 응답에 있나 / deadlineDate=sentinel인가 / dday=null인가)
2. 폼에 제목칸이 왜 없나? 공고 title은 누가·언제 만드나?
3. sourceUrl에 `example.com` 넣으면 왜 막히나? `<form>`도 없는데 검증이 어디서 도나?
4. 작성했는데 목록에 새 글이 안 보인다 — 어디 의심? (`['job-posts']` invalidate + MSW unshift 순서)
5. 이걸 prod에 올리려면 뭐가 선행? (BE POST /job-posts + alwaysOpen prod 배포 + MSW OFF에서 404 안 나는지 확인)
