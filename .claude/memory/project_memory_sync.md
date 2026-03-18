---
name: 메모리 동기화 슬래시 커맨드
description: Claude 메모리와 프로젝트 파일을 GitHub 레포에 동기화하는 슬래시 커맨드 사용법
type: project
---

메모리/프로젝트 동기화는 슬래시 커맨드로 사용 (`.claude/commands/` 에 정의됨)

| 슬래시 커맨드 | 동작 |
|---|---|
| `/pull-mello` | MelloMe_FE_Backup 레포 pull + 로컬 메모리 복사 |
| `/push-mello` | 로컬 메모리 sync + 프로젝트 전체 → MelloMe_FE_Backup 레포 push |

**Why:** 메모리와 프로젝트 코드를 동일 레포(MelloMe_FE_Backup)에서 통합 관리. claude-backup 레포 폐기 (2026-03-18).

**How to apply:** 환경 세팅 시 /pull-mello로 프로젝트+메모리 한 번에 복원.

## 스크립트 정보 (2026-03-18 기준)
- 실제 스크립트: `/Users/jin/my-project/scripts/memory-sync.sh`
- 메모리는 `.claude/memory/`로 레포 내에서 직접 추적
- claude-backup 레포 및 로컬 클론(`/Users/jin/claude-backup-temp`) 삭제 완료
