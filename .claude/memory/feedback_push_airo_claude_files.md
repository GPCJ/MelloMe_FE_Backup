---
name: push-airo 시 Claude 파일 누락 방지
description: /push-airo 실행 시 .claude/, CLAUDE.md, scripts/가 공개 레포에 올라가지 않도록 주의
type: feedback
---

`/push-airo` 실행 시 `.claude/`, `CLAUDE.md`, `scripts/`가 airo 공개 레포에 절대 올라가면 안 됨.

**Why:** rebase/merge 방식으로 `public` 브랜치를 유지하면 `main`에 새로 추가된 `.claude/` 파일이 제거되지 않고 공개 레포에 업로드되는 사고 발생 (2026-03-19 실제 발생).

**How to apply:** `public` 브랜치는 항상 `git reset --hard main` 후 Claude 파일 무조건 제거하는 방식으로만 운영. push 후 airo 레포에 `.claude/` 폴더가 없는지 확인 권장.
