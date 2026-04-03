---
name: Claude Code 플러그인 + hook 설정
description: superpowers, frontend-design 설치 / 버그 키워드 감지 hook 설정
type: project
---

## 설치된 플러그인 (2026-03-29 기준)

### superpowers (obra/superpowers-marketplace)
- systematic-debugging, writing-plans, executing-plans, brainstorming, TDD, verification, code-review, parallel-agents, git-worktrees 등

### frontend-design (claude-plugins-official)
- 개성 있고 완성도 높은 프론트엔드 UI 생성 스킬

## 버그 감지 자동화 hook
`~/.claude/settings.json`에 UserPromptSubmit hook 추가됨.
- 버그/에러 키워드(`버그`, `에러`, `error`, `bug`, `오류`, `실패`, `fail`, `문제`, `issue`, `exception`, `fix`, `수정` 등) 감지
- 감지 시 "superpowers:systematic-debugging 스킬 사용, 근본 원인 먼저 파악" 신호 자동 주입

**Why:** 개발 워크플로우 체계화 및 디버깅 접근 방식 개선.
