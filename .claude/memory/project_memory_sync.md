---
name: 메모리 동기화 슬래시 커맨드
description: Claude 메모리와 프로젝트 파일을 GitHub 레포에 동기화하는 슬래시 커맨드 사용법
type: project
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
