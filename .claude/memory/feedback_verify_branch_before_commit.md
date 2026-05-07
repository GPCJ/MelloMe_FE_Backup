---
name: 커밋 직전 현재 브랜치 검증 필수
description: 세션 시작 git status 스냅샷은 도중에 stale될 수 있음 — 커밋 전 git branch --show-current 확인 후 정책 매칭
type: feedback
originSessionId: ce9e797d-85ca-4535-bbb5-6385cc7e584e
---
커밋 직전에 `git branch --show-current`로 현재 브랜치를 확인하고, 브랜치 정책(main=prod / develop=staging)에 맞는지 검증할 것.

**Why:** 2026-05-07 R-11 작업 중 사고 — 세션 시작 시 git status는 develop으로 떴으나 작업 도중 어딘가에서 main으로 전환된 상태에서 `useWelcomeModal` 추출 변경분을 커밋하려 했음. 사용자가 "develop 맞지?" 확인하지 않았으면 staging 검증 없이 prod에 직행했을 사고. 세션 시작 git status 스냅샷은 시간이 지나면 무효 — `git stash` → `git checkout develop` → `git stash pop` 복구 필요했음.

**How to apply:** 커밋 메시지 draft 직후, `git add`/`git commit` 실행 직전에 `git branch --show-current` 한 번 더. main으로 직접 커밋해야 하는 경우(hotfix 등)는 사용자 명시 승인 필요. 변경분이 잘못된 브랜치에 있으면 `git stash -u → git checkout <correct> → git stash pop` 패턴으로 안전 이관.
