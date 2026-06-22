---
name: feedback_check_memory_format
description: "check-memory 출력 포맷 확정 — 태그 체계, 줄바꿈 원칙, 자동 stale 감지"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 381f3b69-cd44-471f-aeb0-1c3ef27f6452
---

check-memory는 실행 가능성 기반 태그 체계를 사용한다 (2026-06-19 확정).

**규칙:**
- `[오늘 ①②]` = 지금 실행 가능한 항목, 번호 = 우선순위 순
- `[이어가기]` = 워킹트리에 미완 작업이 있는 항목
- `[대기 ★]` = 가장 중요한 블로킹 항목
- `[대기]` = 나머지 블로킹 항목

**Why:** 기존 `★1순위/2순위/passive`는 블로킹 여부를 구분 못 해 "오늘 못 하는 것"이 1순위로 올라오는 혼란 발생.

**How to apply:**
- `·` 기호로 이어 쓰지 말고 항목마다 줄바꿈으로 끊어 출력
- check-memory 실행 시 관련 메모리 파일 대조 → stale이면 notepad_write_priority 자동 갱신 후 출력
- 노트패드 수동 갱신 시에도 동일 태그 포맷 유지
