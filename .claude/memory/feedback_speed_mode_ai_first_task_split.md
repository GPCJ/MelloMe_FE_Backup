---
name: feedback-speed-mode-ai-first-task-split
description: 시간 압박 있는 새 로직 작업 = AI 작성 우선 + Task 단위 분할 + 매 Task별 사전 컨텍스트 설명 → 수동 지시 루프 (학습 모드 보류)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e6719f80-10c5-489c-afe5-fb6b595f6c5d
---

기존 [[feedback_direct_coding_default]]의 "새 로직=본인 작성" 룰에 **시간 압박 시 예외 조건** 추가 (2026-05-29 고민카드 기능 작업 중 자각).

**조건**: 새 로직 컴포넌트/기능이지만 빠른 완성이 우선인 작업. 예: Post-MVP 프로토타입(반응 보고 폐기 가능성), 마감 임박, 사용자가 "이번엔 학습 모드 없이"·"빨리"·"작업 시간이 너무 늘어진다" 류 신호를 보낼 때.

**방식**:
1. AI 코드 생성을 1순위로 두고, 본인 흡수는 사후로 미룸.
2. 단, **한 번에 전체 위임 금지**. 계획서의 Task 단위로 쪼개 지시한다.
3. 각 Task 시작 전에 AI가 "이번에 어떤 코드를 생성할 것"이라는 **자세한 paste-ready 컨텍스트 텍스트**를 사용자에게 제공한다 — [[feedback_cursor_paste_ready_units]] 형식.
4. 사용자가 그 텍스트를 읽고 Cursor IDE 등에 수동으로 복붙해 코드 생성 지시.
5. 결과를 AI가 스펙·계획 대조 후 [[feedback_review_triage_workflow]] severity로 보고 → 사용자가 정정/승인 → 다음 Task 사전 설명 요청 → 루프.

**Why**: 매 Task마다 학습 모드(추상1→2→의사코드→코드, [[feedback_abstract_to_code_resolution_levels]])를 진행하면 작업 시간이 지나치게 늘어남을 2026-05-29 고민카드 세션에서 자각. Task 6(DiagnosisTagInput)은 학습 모드 4단계 끝까지 진행해 흡수도는 높았으나 시간 비용 큼. Task 7(ConcernForm)은 학습 모드 보류 + Cursor 위임으로 같은 분량 작업을 훨씬 짧게 완료, 사후 정정으로 품질도 회복. 사용자 평: 이 방식이 효율적.

**How to apply**:
- 위 트리거 신호를 보이면 학습 모드 진입 보류, 본 모드 진입.
- AI 작성 위임 시 `.claude/deadline-unlock` 4h 창 유지 필요 — [[feedback_direct_coding_default]].
- 각 Task 결과물은 **인지부채 HIGH 메모리 박제 의무 유지** — [[feedback_ai_written_code_cognitive_debt]]. 사후 흡수 부재로 흘리지 않도록.
- 시간 여유가 있는 작업/세션, 또는 사용자가 "이건 핵심 로직이라 깊이 이해하고 싶다"고 명시할 때는 학습 모드로 복귀.
- 사전 컨텍스트 텍스트에 담을 것: 파일 경로, 기존 자산 import 출처, props/state 시그니처, 동작 체크리스트, 가드 규칙, 금지 사항, 검증 명령(tsc/lint).

**사례 (2026-05-29 고민카드 세션)**:
- Task 6 DiagnosisTagInput = 학습 모드 4단계 → 시간 多, 흡수 高.
- Task 7 ConcernForm = AI 우선 모드 → 시간 少, MEDIUM 3건 사후 정정으로 품질 회복.
- Task 8 WriteTypeToggle + Task 9 컨테이너 배선 = 본 모드 유지 합의.
