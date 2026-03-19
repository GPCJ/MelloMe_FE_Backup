---
name: 워크트리 정리 미완료 — main 단일 브랜치로 통합 예정
description: 사용자가 워크트리 방식 포기 결정, 정리 작업 미완료 상태
type: project
---

워크트리 정리 완료 (2026-03-19).

**완료된 것:**
- 워크트리 2개 제거 완료
- 브랜치 `worktree-feature-codegen`, `worktree-code-review` 삭제 완료
- 현재 checkout: `main`
- airo 첫 force push 완료 (`git push airo public:main --force`)

**현재 브랜치 구조:**
- 로컬 `main`: 개발용 (`.claude/`, `CLAUDE.md`, `scripts/` 포함)
- 로컬 `public`: `/push-airo` 실행 시 `main`에서 reset --hard 후 Claude 파일 제거한 스냅샷

**주의:** `public` 브랜치를 rebase/merge로 유지하면 새로 추가된 `.claude/` 파일이 누락 없이 제거되지 않음. 항상 reset --hard 방식 사용.

**Why:** 워크트리를 나눠놨지만 활용도가 낮고 관리가 번거로워서 단순화하기로 함.
