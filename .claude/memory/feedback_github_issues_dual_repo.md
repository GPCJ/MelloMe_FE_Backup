---
name: GitHub 이슈 두 레포 동시 생성
description: gh issue create 시 MelloMe_FE_Backup과 AIRO-offical/therapist_community_FE 두 곳에 모두 생성
type: feedback
---

GitHub 이슈 생성 시 두 레포 동기화가 기본이지만, **기계적으로 항상 2개 만들지 말 것**.
목적에 따라 판단 필요:

- 프론트 기술부채/버그 → 두 레포 동시 생성 (MelloMe_FE_Backup + airo FE)
- 백엔드 API 변경 요청 → BE 이슈 1개 + 프론트 코드 주석에서 참조로 충분
- 프론트 임시 대응 기록 → 코드 주석으로 충분, 별도 이슈 불필요

**Why:** 프론트 이슈가 불필요하게 생성되어 바로 닫아야 했던 사례 발생 (04-05).
**How to apply:** 이슈 생성 전 "이 이슈가 프론트/백엔드 각각 필요한가?" 먼저 판단.
