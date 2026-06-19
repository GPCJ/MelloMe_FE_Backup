---
name: feedback_selfqa_merge_gate
description: "AI 작성 코드 머지 불안 처리 — \"안 짠 것\" vs \"미완성\" 분리 + 셀프 QA 2반(자동 e2e + 박제 자기점검)으로 팀 QA 부재 머지 정당화"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 63e114a1-d27c-4231-ae36-e5a6cf92bc1e
---

팀 QA가 안 들어오거나 AI가 많이 작성한 코드를 prod에 올릴 때 사용자가 "올려도 되나" 불안해하면, 2026-06-10 팔로우 prod 머지에서 검증된 프레임으로 처리한다.

**1) 불안의 정체를 분리한다.** "머지 가능성"(=행동·검증으로 결정)과 "내가 손으로 안 짠 것"(=authorship)을 가른다. 기능이 완결된 슬라이스고 깨진 화면이 없으면 **불안은 대개 미완성 신호가 아니라 authorship 잔상**. 단 합리적 핵심 하나: prod에서 터졌을 때 본인이 그 코드를 따라갈 수 있는가(=인지부채). 못 따라가면 그건 머지 리스크가 아니라 **본인 리스크**이고, 그때만 불안이 진짜 신호다.

**2) 셀프 QA = 2반으로 정당화한다.**
- **동작 회귀**: 자동 e2e(이번엔 Playwright)로 Hot Path 회귀 + 핵심 플로우를 실서버(staging)에 돌려 green. 미자동화 항목은 저위험/무관임을 명시(과대선언 금지).
- **코드 오너십**: 박제 메모리의 자기점검 질문을 **본인 말로** 답하게 함([[feedback_ai_written_code_cognitive_debt]]·[[feedback_learning_gap_socratic_checkin]]). 통과 = 부채 갚임 = 불안의 정체가 authorship임이 증명됨.
- **둘 다 통과하면** 팀 QA 부재여도 머지 정당. 자기점검 통과 후에도 남는 불안은 무시하고 추진([[feedback_unblock_by_persuasion]]).

**Why:** 사용자는 AI 의존 불안이 주기적으로 재출현([[user_ai_dependency_anxiety]])하고, 머지 직전에 그게 "미완성 같다"는 형태로 나온다. 막연한 안심("괜찮아 올려")은 안 통하고, 증거(테스트 green + 자기점검 답)로 전환해야 추진력이 생긴다. 이번엔 자기점검 4개(이중 토글 분리·hooks 순서·캐시 부분매칭·스크롤 store) 통과 후 본인이 "대단한 코드 아니네"로 닫고 머지 결정.

**How to apply:** 머지 불안 신호 시 → ① 기능 완결성/깨진 화면 여부 먼저 확인(객관) → ② 박제 자기점검 제시(못 답하면 코드부터 읽기, 답하면 통과) → ③ 자동 e2e 동작회귀(없으면 핵심만 수동) → ④ 둘 다 green이면 "근거 충분, 올려도 됨" 단언 + 잔여 한계 정직하게 1줄. 관련 [[project_follow_feature]](첫 적용 사례), [[user_code_reading_what_vs_why]].
