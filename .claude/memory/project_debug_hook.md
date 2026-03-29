---
name: 버그 감지 자동화 hook 설정
description: UserPromptSubmit hook으로 버그/에러 키워드 감지 시 systematic-debugging 스킬 자동 알림 (2026-03-29)
type: project
---

## 설정 내용

`~/.claude/settings.json`에 UserPromptSubmit hook 추가됨 (2026-03-29).

**동작 방식:**
- 버그/에러 관련 키워드(`버그`, `에러`, `error`, `bug`, `오류`, `실패`, `fail`, `문제`, `issue`, `exception`, `fix`, `수정` 등) 포함된 메시지 감지
- 감지 시 Claude 컨텍스트에 "superpowers:systematic-debugging 스킬 사용, 근본 원인 먼저 파악" 신호 자동 주입

**Why:** 이리저리 시도하며 해결하는 방식 대신 → 문제 정의 → 근본 원인 파악 → 해결 순서로 강제.

**How to apply:** 별도 조작 불필요. 버그 관련 대화 시 자동 적용됨.
