---
name: 백업 레포 URL + Vercel 배포 트리거
description: my-project의 git remote 매핑. origin = MelloMe_FE_Backup이 곧 Vercel 배포 레포(이름이 Backup일 뿐 실제 배포 소스). airo는 협업용 별도 레포. 메모리 동기화는 별도 claude-backup.
type: reference
updated: 2026-04-15
originSessionId: 3599b53a-b50a-42ce-a92e-91432d0449b0
---
## git remote 매핑
- **origin** = `https://github.com/GPCJ/MelloMe_FE_Backup` → **Vercel 자동 배포 트리거**
  - 이름이 "Backup"이지만 실제 배포 소스. 헷갈리지 말 것.
  - `git push origin main` 한 번으로 배포까지 끝.
- **airo** = `https://github.com/AIRO-offical/therapist_community_FE` → 협업 레포 (Vercel과 무관)
  - 코드 협업/이슈 관리용. 배포 트리거 X.
  - 사용 시: `./scripts/push-airo.sh`

## 메모리 동기화 (코드와 별개)
- **Claude 메모리 전용**: `https://github.com/GPCJ/claude-backup`
- 슬래시 커맨드: `/push-mello`, `/pull-mello` (메모리 + 프로젝트 디렉토리 백업 동기화 — 코드 push와 다름)

## 흔한 혼동
- "MelloMe_FE_Backup이 백업이니까 push 안 해도 되겠지?" → ❌ 이게 배포 소스
- "airo에 push해야 배포되겠지?" → ❌ airo는 협업만, Vercel 미연결
- "push-mello 슬래시는 코드 push?" → ❌ 메모리 동기화 스크립트, 코드는 `git push origin main`
