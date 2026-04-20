---
name: push-airo 스크립트화 및 방식 변경
description: push-airo를 scripts/push-airo.sh로 스크립트화, main 기준 public 재생성 방식으로 변경
type: project
---

push-airo 커맨드를 `scripts/push-airo.sh` 스크립트 호출 방식으로 변경 (승인 5~6회 → 1회).

**기존 방식 (문제)**: `airo/main` 기준 reset → `frontend/`만 cherry-pick → main과 히스토리 분리되어 코드가 이전 커밋으로 돌아가는 버그 반복.

**새 방식**: main에서 public 브랜치 매번 재생성 → `.claude/`, `CLAUDE.md`, `scripts/` tracking 제거 → force push. 항상 main 최신 상태 반영.

**방어 로직**: main 아닌 브랜치에서 실행 시 자동 이동, uncommitted 변경 stash, `trap`으로 실패 시 main 자동 복귀, git rm 개별 실행 + 실패 무시, .gitignore 중복 방지.

**Why:** 기존 방식은 main과 public 히스토리가 분리되어 push할 때마다 최신 코드가 사라지는 근본적 결함이 있었음.

**How to apply:** `/push-airo` 실행 시 `./scripts/push-airo.sh` 1회 실행. 변경사항 없으면 조기 종료.
