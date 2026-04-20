---
name: 새 환경 세팅 후 첫 작업은 pull-mello
description: SSD 포맷/새 머신/깨끗한 clone 상태에서 첫 메모리 작업 전 반드시 `pull-mello`부터. push-mello는 로컬이 권위 있는 상태일 때만.
type: feedback
originSessionId: b6f844ce-ccb5-4c47-a5ba-95c70db3b21d
---
`~/.claude/projects/.../memory/` 가 비어있거나 일부 파일만 있는 상태에서 **절대 `push-mello`를 먼저 돌리지 않는다**. 세션을 시작하기 전에 반드시 `./scripts/memory-sync.sh pull-mello` 를 실행해서 레포의 메모리 자산을 먼저 로컬로 끌어온다.

**Why:** 2026-04-20, SSD 포맷 후 새 환경에서 pull 없이 세션을 진행해 로컬이 13개 상태로 쌓였고, 그 상태에서 `push-mello`가 돌아 레포의 **120+ 파일이 `rsync --delete` 로 대량 삭제**된 사고 발생. Revert로 복구는 했지만, 이전 세션들의 축적 자산(user 메모리 3개 + feedback 40+ + project 60+)이 순간 날아갈 위험이 재발할 수 있음.

**How to apply:**
- 새 머신/VM/컨테이너/포맷 직후 → 먼저 `pull-mello`
- `~/.claude/projects/.../memory/` 경로가 빈 것처럼 보이거나 파일이 평소보다 훨씬 적어 보이면 → `pull-mello` 후 차이 확인
- 확신이 없으면 수동 백업 권장 경로: `~/claude-memory-backups/mello_memory_backup_<YYYYMMDD_HHMMSS>/`
- 스크립트(`scripts/memory-sync.sh`)에 2중 가드 존재:
  - 파일 < 5개 → `guard_memory_src_not_empty` abort
  - 로컬 < 레포 * 50% → `guard_no_mass_deletion` abort (2026-04-20 교훈으로 추가)
  - 의도한 대량 정리라면 `FORCE_PUSH=1 ./scripts/memory-sync.sh push-mello`

즉, **가드가 있으니 안심하라**가 아니라 **가드가 있어도 새 환경이면 pull부터**가 원칙. 가드는 마지막 방어선.
