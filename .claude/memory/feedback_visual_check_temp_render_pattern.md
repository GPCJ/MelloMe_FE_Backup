---
name: feedback_visual_check_temp_render_pattern
description: 이해 안 된 표시 컴포넌트를 시각 확인할 때 = 임시 강제 렌더 → dev 확인 → git restore로 원복하는 최소 비용 패턴
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 75a2006e-f12b-4ab4-a37f-9d6510f795ad
---

이해 안 된 표시 컴포넌트의 화면 결과가 머릿속에 그려지지 않을 때, **임시 강제 렌더 → dev 시각 확인 → `git restore`로 원복(커밋 X)**.

**Why**: 표시 컴포넌트는 props 한 묶음만 정해지면 즉시 시각 결과가 나옴. 그런데 본 분기 코드(`postType === ... ? <Card /> : ...`)를 먼저 짜면 실제 데이터가 안 내려와서(예: 백엔드 미배포) 시각 확인이 막힘. 컴포넌트만 단독으로 한 화면에 박아 더미 props로 보는 게 가장 빠른 검증 경로.

**How to apply**:
1. 가장 흔한 진입점(피드 카드/리스트 페이지 등)의 본문 영역에 임시 import + 더미 props로 컴포넌트 강제 렌더 — `{/* TEMP: 시각 확인용 — 확인 후 제거 */}` 주석 박기
2. `npm run dev`로 화면에서 확인. 분기 케이스(예: 마스킹) 보려면 props 한 줄만 바꿔서 새로고침
3. 확인 끝나면 **커밋 X**, `git restore <file>`로 깔끔히 원복
4. 그 다음에야 본 분기 코드를 작성 — 이미 화면 결과가 머릿속에 박혀있어 분기 의도가 명확해짐

**적용 조건**:
- 표시(read-only) 컴포넌트 — 부수효과 없는 것
- 호출부(본 분기 코드)가 아직 없거나, 실제 데이터가 안 내려오는 상황
- 단독 스토리북/플레이그라운드가 프로젝트에 없을 때

**사례 — 2026-05-28 ConcernCard**: JSX 복붙해서 머릿속에 안 박혔던 상황. PostCard 본문 분기 자리에 ConcernCard를 더미 props(`ageGroup="AGE_3_5"`, `diagnoses=['자폐스펙트럼장애', ...]`, `body={post.contentPreview}`, `clamp`)로 강제 렌더 → 모든 카드 위에 동일 ConcernCard 노출 → 마스킹은 `diagnoses={null}`·`otherNotes={null}`로 토글 확인 → `git restore`로 원복 → Task 5 본 분기 코드는 그 다음 본인 손으로 작성. 시각 박힘 → 분기 흐름도 명확.

관련: [[user_comprehension_criterion]] (이미지/구조 떠올라야 흡수), [[feedback_learning_mode_understanding_over_drafts]] (산출물보다 본인 이해 우선).
