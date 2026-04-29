---
name: 메모리 동기화 슬래시 커맨드
description: Claude 메모리와 프로젝트 파일을 GitHub 레포에 동기화하는 슬래시 커맨드 사용법
type: project
originSessionId: b6f844ce-ccb5-4c47-a5ba-95c70db3b21d
---
메모리/프로젝트 동기화는 슬래시 커맨드로 사용 (`.claude/commands/` 에 정의됨)

| 슬래시 커맨드 | 동작 |
|---|---|
| `/pull-claude` | claude-backup 레포 → 로컬 메모리 |
| `/push-claude` | 로컬 메모리 → claude-backup 레포 (메모리만) |
| `/pull-mello` | MelloMe_FE_Backup 레포 pull + 로컬 메모리 복사 |
| `/push-mello` | 프로젝트 전체 → MelloMe_FE_Backup 레포 push |

**Why:** 맥북 이전 또는 환경 변경 시 메모리와 프로젝트 코드를 각각 독립적으로 백업/복원하기 위해 분리.

**How to apply:** 환경 세팅 시 /pull-claude로 메모리 복원, /pull-mello로 프로젝트 복원.

## 스크립트 정보 (2026-03-17 기준)
- 실제 스크립트: `/Users/jin/my-project/scripts/memory-sync.sh`
- 백업 레포 로컬 클론: `/Users/jin/claude-backup-temp`
- claude-backup 레포 브랜치: `main` (master에서 변경됨)
- 스크립트가 없으면 재생성 필요 (삭제된 적 있음)

## 2026-04-20 사고 + 가드 강화
- **사고 요약**: SSD 포맷 후 `pull-mello` 없이 새 환경에서 세션 진행 → 로컬에 메모리 13개만 쌓인 상태로 `push-mello` 실행 → `rsync --delete` 때문에 레포의 120+ 파일이 대량 삭제됨 (commit `9c75a33`). Revert(`c1578ec`) + merge push(`7b6923d`)로 당일 복구 완료.
- **기존 가드의 한계**: `guard_memory_src_not_empty`는 파일 < 5개만 차단. 13개는 통과해버림.
- **추가된 가드 (`guard_no_mass_deletion`)**:
  - 레포 파일 수 대비 로컬이 **50% 미만**이면 abort
  - `FORCE_PUSH=1` 환경변수로 명시적 우회 가능 (의도한 대량 정리일 때)
  - push-mello 실행 순서 조정: `git pull` → 가드 → rsync → commit → push (rsync 전에 레포 상태를 읽어야 가드가 정확하게 동작)
- **durable 백업 위치**: `~/claude-memory-backups/` (사고 복구 시 `/tmp`에 백업했다가 이관). 복구 전 수동 백업은 이 경로 권장.

## 2026-04-29 develop 브랜치 sync 전환 + 자동 브랜치 전환 헬퍼

### 변경 요약
- push-mello / pull-mello 둘 다 **develop 브랜치 대상**으로 변경 (이전 main 대상에서 전환)
- 신규 헬퍼 함수 2개:
  - `ensure_on_develop`: 현재 브랜치 != develop이면 미커밋/untracked 변경분 stash 후 checkout develop
  - `restore_orig_branch`: 원래 브랜치 복귀 + stash pop
- main은 코드 PR merge 흐름으로만 갱신 (memory sync로 main 직접 커밋 안 함)

### Why
2브랜치 정책(`feedback_branch_preference.md` 2026-04-29 갱신) 도입 후 develop이 일상 작업 브랜치가 됨. 메모리 sync도 develop으로 통일하면 "main 직접 push 금지" 정책 자동 충족.

### 사고 회피 (2026-04-29 동일 세션)
- 패치된 스크립트가 develop에만 있는데 main으로 checkout 후 실행 → working tree가 OLD 스크립트로 회귀 → main 직접 push 발생 → force-push로 회복
- 교훈은 `feedback_branch_aware_script_test.md` 참조

### 다른 기기 첫 셋업
- `git clone` 후 `git checkout develop` 한 번 필요 (default branch는 여전히 main)
- pull-mello 첫 실행 시 `ensure_on_develop`이 자동 처리하지만, 명시적 checkout이 더 안전
