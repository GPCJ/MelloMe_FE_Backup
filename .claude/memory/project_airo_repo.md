---
name: airo 공개 레포 설정 현황
description: therapist_community_FE 공개 레포 remote 추가 및 push-airo 커맨드 상태
type: project
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
