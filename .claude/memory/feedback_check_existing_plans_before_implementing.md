---
name: feedback_check_existing_plans_before_implementing
description: 기능 구현 착수 전 docs/(특히 docs/superpowers/plans/) 기존 계획서 grep 먼저 — 추측 구현 방지
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 16ae526c-c423-4b51-b754-8be354c49bde
---

기능 구현 착수 전 **`docs/`(특히 `docs/superpowers/plans/`)에 그 기능 계획서가 있는지 grep부터** 한다. `src`만 탐색하지 말 것.

**Why:** 2026-07-03 구인공고 Phase 2 작성 폼을 만들 때, `src`만 보고 내 추측(title 입력칸 둠, sourceUrl 선택)으로 구현했다. 뒤늦게 06-29 superpowers 세션이 만든 `docs/superpowers/plans/2026-06-26-job-posting-phase2-crud.md`에 **staging `/v3/api-docs` 실측 BE 계약**이 박혀 있는 걸 발견 → title(BE 서버 파생이라 요청 제외)·sourceUrl(필수) 두 곳을 재작업. 계획서엔 추측으로는 알 수 없는 실측 계약·미해결 질문·분담이 들어있어 내 가정을 덮어쓴다.

**How to apply:**
- 새 기능/큰 작업 착수 전: `docs/`·`docs/superpowers/plans/` 를 기능 키워드로 grep. 계획서 있으면 먼저 읽고 그 계약/결정을 기준으로 삼는다.
- "이거 예전에 계획/설계한 적 있나?" 신호(Phase N, CRUD, 특정 기능명)가 있으면 필수.
- 계획서가 오래됐으면(이번처럼 그 뒤 BE 계약이 바뀐 경우) 최신 결정과 대조해 어느 쪽이 최신인지 판정. [[feedback_verify_spec_before_workaround]] [[project_job_posting_feature]]
