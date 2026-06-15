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
- **main SHA drift 주의**: cherry-pick 기반 동기화는 origin/airo 양쪽 main SHA를 어긋나게 만들 수 있고, push-airo가 main을 일관 동기화하지 않을 수 있음. 2026-05-11 강제 동기화(`reset --hard develop`+`--force-with-lease`)로 양쪽 `dd9ed7d` 통일한 이력 있음(force-push 절차는 [[feedback_force_push_safety_protocol]]).

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

## auto-memory가 유일한 원본 (2026-05-20 박제 — notion_draft 2개 관리 혼란 해소)

**규칙: 모든 메모리 파일(notion_draft.md 포함)은 auto-memory(`MEMORY_SRC`)에서만 편집한다. 레포 사본(`$PROJECT_REPO/.claude/memory/`)은 생성물이므로 직접 손대지 말 것.**

- **Why**: push-mello는 `rsync -a --delete MEMORY_SRC/ → 레포` 단방향 미러링(스크립트 99-101행). **auto-memory가 항상 이긴다.** 레포 사본을 편집하면 다음 push 때 auto-memory 버전으로 덮어써져 편집이 날아가거나, 의도한 변경이 push되지 않는다.
- **사고 사례 (2026-05-20)**: notion_draft를 레포 사본(`MelloMe_FE_Backup/.claude/memory/`)에서 편집 → push-mello가 stale한 auto-memory 버전을 push → 편집분이 main 워킹트리에만 uncommitted로 남고 누락. auto-memory로 복사 후 재push로 해소.
- **혼란 원인**: 사람이 자연스럽게 여는 곳(VSCode, `/post-notion-draft`)이 레포 사본이라, 거기서 편집하기 쉬움. 하지만 sync 원본은 auto-memory.
- **How to apply**: ① 메모리/노션초안 편집은 `MEMORY_SRC`(`/home/jin24/.claude/projects/-home-jin24-MelloMe-FE-Backup/memory/`) 경로 파일을 직접 수정 ② VSCode로 열 때도 auto-memory 경로를 열기 ③ 레포 사본이 워킹트리에 modified로 떠도 그건 미러일 뿐, 진실은 auto-memory ④ 코드 변경(.tsx 등)은 이 규칙과 무관, 일반 git 커밋 흐름. [[feedback_branch_aware_script_test]] 참조.

## 2026-06-03 재발 + 강제 방지책 2종 (develop `bbe96eb`)

위 규칙(2026-05-20 박제)이 있었는데도 **재발**: 이번 세션에서 Claude가 notion_draft를 레포 사본 경로(`MelloMe_FE_Backup/.claude/memory/`)에서 Read/Edit. push-mello 직전 auto-memory가 stale함을 발견해 **사본→원본 역복사로 사고 회피**(초안 전체 소실 직전). 교훈: **memory 규칙은 참고 컨텍스트라 강제력이 없음** → 반복 위반 시 우선순위 상위 수단으로 escalate.

**escalate한 방지책 2종:**
1. **CLAUDE.md IMPORTANT 규칙** — "메모리/노션초안의 유일한 편집 원본은 auto-memory(`MEMORY_SRC`), 레포 사본 직접 편집 금지". 프로젝트 지시라 memory보다 우선순위 높아 Claude가 반드시 따름.
2. **`memory-sync.sh` `guard_no_direct_mirror_edit`** — push-mello 시작 시 레포 사본 `.claude/memory/`가 git-dirty(직접 편집됨)면 abort. **반드시 `ensure_on_develop`(stash)보다 먼저 호출** — stash되면 편집이 숨어 감지 불가. 정상 흐름은 원본만 편집→사본 깨끗→오탐 없음. `FORCE_MIRROR_EDIT=1`로 우회. abort 메시지가 "원본으로 옮긴 뒤 `git restore .claude/memory/`로 사본 비우고 재실행"을 안내.

**주의(전이 한계):** 가드는 develop에만 존재 → 작업 브랜치는 develop 머지 후에야 가드 보유(branch-aware-script 한계, [[feedback_branch_aware_script_test]]). 또한 사본이 dirty인 채 가드 보유 브랜치에서 push-mello 돌리면(이번처럼 내용은 이미 원본·develop에 안전해도) abort됨 → `git restore .claude/memory/`로 비우고 재실행하면 무손실.
