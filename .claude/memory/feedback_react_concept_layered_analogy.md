---
name: react-concept-layered-analogy
description: React 내부 개념 설명 시 단일 비유 체계를 누적 확장하면 사용자 흡수율이 높음 (2026-05-20 검증된 성공 패턴)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d2af7607-ebbd-49c9-bc7d-0ff4c55a8f73
---

React 내부 개념(fiber/state/ref/effect/생명주기 등)을 설명할 때, 개념마다 새 비유를 만들지 말고 **하나의 비유 체계를 세워 새 개념을 거기에 매핑·확장**하면 흡수율이 매우 높다.

2026-05-20 세션 검증: `집=fiber(인스턴스) / 우편함=state / 메모=ref / 거주자 활동=effect` 한 체계로 fiber·리렌더·StrictMode 언마운트·useEffect 동기화·비동기 race 도달성까지 일관 설명 → 빠르게 이해 + 사용자가 자기 말로 정확히 재진술.

**Why**: 사용자는 이미지/구조가 떠올라야 흡수([[user_comprehension_criterion]]). 개념마다 비유가 따로면 분절되어 개념 간 관계가 안 보이지만, 한 체계를 누적하면 "집이 철거되면 우편함도 사라진다(언마운트=fiber 파괴 시 state 소멸)"처럼 관계까지 한 그림에 담긴다.

**How to apply**: "내가 이해할 때까지 가이드해줘" 류 깊은 학습 요청 시 — ① 첫 개념에서 비유 체계를 세우고 ② 새 개념이 나오면 기존 비유에 요소를 추가(새 비유 만들지 말 것) ③ 사용자가 자기 말로 재진술하면 정/오 판정으로 한 단계씩 닫기. [[feedback_socratic_code_excerpt_pattern]](React 모델은 추상/비유 설명)의 구체화이며 [[feedback_learning_mode_understanding_over_drafts]]와 함께 적용. 학습 진척은 [[user_react_internals_learning]]에 누적.
