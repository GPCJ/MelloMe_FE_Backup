---
name: project-filterchips-drag-scroll-cognitive-debt
description: "FilterChips 데스크탑 드래그 스크롤 — AI(Cursor) 작성 코드, 이해 미완 커밋, 인지부채 HIGH"
metadata: 
  node_type: memory
  type: project
  originSessionId: 92a97fde-0e73-4067-bcd4-a55928f3ac51
---

`components/common/FilterChips.tsx`에 데스크탑 마우스 드래그 가로 스크롤 추가 (2026-05-21, 커밋 `ec36f5f`, develop 로컬). A안: scrollRef + dragRef{isDown,startX,startScroll,dragged}, onMouseDown/Move/Up·Leave로 `scrollLeft` 조작, `|walk|>5px` 시 `dragged=true` → 칩 onClick에서 필터 선택 무시. 모바일 터치는 네이티브.

**인지부채 HIGH.** Cursor IDE에서 시각적 diff 확인 겸 AI로 작성. 사용자가 코드를 읽어도 특히 `if (Math.abs(walk)>5)` 드래그/클릭 판정 블록이 이해 안 됨을 자각 → 줄 단위로 함께 해독함(설명 완료). 단, "손으로 1~10 짰으면 질문 없이 이미 이해했을 것"이라 판단. 피곤해서 undo·재작성은 보류하고 현 코드 그대로 커밋.

**Why:** AI 작성 코드는 읽어서 사후 해독해도 직접 타이핑 대비 체득이 약함 ([[user_self_coding_goal]], [[feedback_learning_mode_understanding_over_drafts]], [[feedback_ai_written_code_cognitive_debt]]).

**How to apply:** 컨디션 회복 후 이 파일을 baseline(드래그 기능 전 단순 버전)으로 되돌려 손으로 재구현하는 학습 과제 권장. happy path→테스트→깨지는 거 고치기 순서로 가면 `if`문(클릭/드래그 구분)이 5단계에서 스스로 도출됨. drag-to-scroll 기성 라이브러리는 수동 구현 후 탐색하기로 함(사용자 결정).
