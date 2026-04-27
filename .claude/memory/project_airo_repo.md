---
name: airo 공개 레포 설정 현황
description: therapist_community_FE 공개 레포 remote 추가 및 push-airo 커맨드 상태
type: project
originSessionId: 795e24ed-d2c2-4561-9722-2a738013005f
---
공개 레포(therapist_community_FE)를 위한 `airo` remote 추가 및 `public` 브랜치 설정 완료.

- **remote 이름:** `airo`
- **URL:** https://github.com/AIRO-offical/therapist_community_FE
- **`public` 브랜치:** `/push-airo` 실행 시 `main`에서 reset --hard 후 Claude 파일 제거하는 방식
- **`/push-airo` 슬래시 커맨드:** `.claude/commands/push-airo.md`
- **첫 push:** 완료 (2026-03-19)

**push-airo 동작 방식 (2026-03-19 개선):**
1. Claude 관련 파일 제외 후 미커밋 변경사항 확인 → 있으면 자동 커밋
2. Claude 파일만 변경된 경우 "프론트엔드 변경사항 없음" 출력 후 중단
3. `public` 브랜치를 `main`으로 reset --hard (rebase/merge 방식 폐기)
4. `.claude/`, `CLAUDE.md`, `scripts/` 무조건 제거 후 force push

**Why:** rebase/merge 방식은 새로 추가된 `.claude/` 파일이 누락 없이 제거되지 않아 공개 레포에 실수로 업로드되는 문제 발생. reset --hard로 해결.

**How to apply:** `/push-airo` 실행. force push이므로 항상 승인 후 진행.

## Vercel 배포는 airo 아님 (2026-04-27 확인)

**Vercel은 백업 레포(MelloMe_FE_Backup)에 연결되어 있습니다.** airo 레포(therapist_community_FE)는 private라 Vercel 연결 시 유료 결제가 필요해 미연결입니다. 따라서:

- 배포 트리거 = `git push origin main` (백업 레포 push 시점에 Vercel 빌드 시작)
- `push-airo`는 코드 미러링/포트폴리오 공개용일 뿐 배포에는 영향 없음
- 배포 환경 검증은 백업 레포 push 후 `www.melonnetherapists.com` 확인

## 민감/불필요 파일 정리 (2026-03-25)
아래 파일들을 airo 레포에서 제거 완료. `.gitignore`에도 추가해 재추적 방지.
- `.env.docker` — Google OAuth 크리덴셜, JWT 시크릿 포함 (보안)
- `docker-compose.yml` — 백엔드 인프라 파일
- `openapi-3.0.yaml` — 백엔드 API 스펙
- `/package-lock.json` (루트) — 빈 lock 파일
