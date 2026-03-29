---
name: superpowers 플러그인 설치 현황
description: superpowers, frontend-design 플러그인 설치 완료 및 figma 플러그인 제거 (2026-03-29)
type: project
---

## 설치된 플러그인 (2026-03-29 기준)

### superpowers (obra/superpowers-marketplace)
- 마켓플레이스: `obra/superpowers-marketplace` 등록 후 설치
- 주요 스킬:
  - `superpowers:systematic-debugging` — 버그 만났을 때 근본 원인 먼저 파악, 수정 나중
  - `superpowers:writing-plans` — 구현 전 계획 문서화
  - `superpowers:executing-plans` — 계획 실행
  - `superpowers:brainstorming` — 새 기능 만들기 전 탐색
  - `superpowers:test-driven-development` — 구현 전 테스트 먼저
  - `superpowers:verification-before-completion` — 완료 선언 전 검증
  - `superpowers:requesting-code-review` / `superpowers:receiving-code-review`
  - `superpowers:dispatching-parallel-agents` — 독립 작업 병렬 처리
  - `superpowers:using-git-worktrees` — 작업 격리
- SessionStart hook: 세션 시작 시 스킬 컨텍스트 자동 주입

### frontend-design (claude-plugins-official)
- 개성 있고 완성도 높은 프론트엔드 UI 생성 스킬
- UI 작업 시 "AI스러운 평범한 디자인" 방지

### figma (claude-plugins-official)
- **제거됨** (2026-03-29) — 피그마 미사용으로 삭제

**Why:** 개발 워크플로우 체계화 및 디버깅 접근 방식 개선 목적.

**How to apply:** 버그/에러 상황에서 systematic-debugging 스킬 자동 사용. 새 기능 구현 전 brainstorming → writing-plans 순서 권장.
