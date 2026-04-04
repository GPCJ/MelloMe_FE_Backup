---
name: GitHub 이슈 두 레포 동시 생성
description: gh issue create 시 MelloMe_FE_Backup과 AIRO-offical/therapist_community_FE 두 곳에 모두 생성
type: feedback
---

GitHub 이슈 생성 시 항상 두 레포에 동시 생성할 것:
1. `GPCJ/MelloMe_FE_Backup` (origin)
2. `AIRO-offical/therapist_community_FE` (airo)

**Why:** 팀 레포(airo)와 백업 레포(origin) 양쪽에서 이슈 추적이 필요함.
**How to apply:** `gh issue create` 실행 시 동일 제목/본문으로 두 번 호출. 사용자 확인 후 두 레포 동시 업로드.
