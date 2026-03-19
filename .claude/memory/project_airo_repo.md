---
name: airo 공개 레포 설정 현황
description: therapist_community_FE 공개 레포 remote 추가 및 push-airo 커맨드 상태
type: project
---

공개 레포(therapist_community_FE)를 위한 `airo` remote 추가 및 `public` 브랜치 설정 완료.

- **remote 이름:** `airo`
- **URL:** https://github.com/AIRO-offical/therapist_community_FE
- **`public` 브랜치:** main에서 파생, `.claude/`, `CLAUDE.md`, `scripts/` 제거된 상태
- **`/push-airo` 슬래시 커맨드:** `.claude/commands/push-airo.md` 생성 완료
- **첫 push:** 미완료 — remote에 Initial commit이 있어 force push 필요, 사용자 승인 대기 중

**Why:** Claude Code 관련 파일(메모리, 커맨드 등)을 공개 레포에 올리지 않기 위해 브랜치 분리 방식 채택.

**How to apply:** `/push-airo` 실행 시 force push 승인 먼저 받을 것. 첫 push는 `git push airo public:main --force` 필요.
