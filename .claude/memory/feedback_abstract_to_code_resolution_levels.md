---
name: feedback-abstract-to-code-resolution-levels
description: 학습 모드 코드 작성 시 4단계 해상도(추상1 화면·행동 → 추상2 데이터모델·소유권 → 의사코드 → 코드)로 사용자가 직접 추론·작성
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a9d9d991-5539-4f81-ae50-d9fb3842ff8d
---

새 로직 학습 모드에서, AI가 코드/의사코드를 먼저 구상하고 사용자가 이해하는 흐름이 아니라 **사용자가 추상에서 출발해 본인 머리로 해상도를 올려가는** 흐름으로 진행한다.

**Why:** 2026-05-28 고민 카드 Task 6 `DiagnosisTagInput` 작성 중 사용자가 명시 — "AI가 코드를 먼저 구상해두면 그것을 이해하는 과정이라 근본적으로 스스로 생각해서 하는 코딩과 구조적으로 다름. 원래 프로그래머는 추상적 구상에서 시작해 점점 코드 레벨로 해상도가 높아지는데, AI와 코딩하면 그 흐름이 거꾸로 됨." [[user_self_coding_goal]]/[[user_dev_style]]("설계 약 자각")와 직결. 기존 [[feedback_pseudocode_first_protocol]]은 의사코드 단계부터인데, 그 앞 "왜 그 의사코드인가" 추론을 AI가 다 해버려서 학습 흡수 안 됨.

**How to apply:**

4단계 순서로 진행. 각 단계는 **사용자가 먼저 답하고 AI는 빠진 케이스/모호 지점만 짚음**.

1. **추상 1 — 화면 + 사용자 행동**: 코드 한 글자도 없이 "사용자 눈에 뭐가 보이고, 뭘 할 수 있나"만 사용자 입으로. 빈 상태/입력 중/추가됨/삭제 등 상태별로.
2. **추상 2 — 데이터 모델 + 소유권**: 그 화면을 그리려면 무슨 값이 필요한가, 자료구조는 무엇인가, 누가 소유(부모 vs 자식)하나, state/ref/파생값 중 무엇인가.
3. **의사코드**: 액션이 데이터를 어떻게 바꾸는지 한국어로 함수 단위로. 함수명·시그니처·가드만 정함.
4. **코드**: 의사코드 줄을 React/TS 문법으로 옮김. 막힌 줄 단위 질문.

**규칙:**
- 사용자가 "모르겠다"고 답하면 코드 먼저 안 줌. **한 단계 위 추상으로 끌어내림**(예: 자료구조 모르면 본인이 박은 타입을 떠올리게 함 — Task 6에서 `PostCreateRequest.diagnoses?: string[]` 환기로 해결).
- 사용자가 정답을 맞혀도 **"왜 그게 맞는가"를 본인 문장으로** 적게 함. 이유 말 못하면 안 박힘.
- 빠진 가드/엣지 케이스(예: 명세에 박힌 max/중복/길이)는 AI가 짚어주되 UX 결정은 사용자.

**트리거:** 새 로직 작성([[feedback_direct_coding_default]] "새 로직=본인 작성" 영역), 사용자가 "어렵다"/"막막하다" 신호 + 학습 의지 표시 시.

**관련:** [[feedback_pseudocode_first_protocol]], [[feedback_learning_mode_understanding_over_drafts]], [[user_self_coding_goal]], [[user_dev_style]], [[user_comprehension_criterion]], [[feedback_direct_coding_default]]
