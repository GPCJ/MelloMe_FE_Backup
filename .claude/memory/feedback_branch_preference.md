---
name: 브랜치 정책 — main(prod) + develop(staging)
description: 네이밍 main(master 금지). 1인 운영 — develop=최신, main=prod 게이트(cherry-pick). ff-only merge 불가 정상.
type: feedback
updated: 2026-05-07
originSessionId: 5675044e-f887-4f9b-b8dc-a0b07f4a86ee
---
## 1. 네이밍 — main 사용 (master 금지)

새 레포 생성, 브랜치 이름 지정, 기본 브랜치 설정 시 항상 `main`. `master` 금지.

**Why:** 사용자가 "나는 브랜치 main이 좋은데"라고 명시적으로 표현.

## 2. 운영 정책 — main + develop 2브랜치 (2026-04-29 갱신)

이전 "브랜치 main만" 정책은 폐기. 백엔드 dev/prod 서버 분리(2026-04-29 staging URL 수신)에 맞춰 Vercel preview를 staging API에 연동해 팀원이 WIP 검증할 수 있도록 develop 브랜치 추가 운영.

```
main    → Vercel Production → www.melonnetherapists.com (prod API)
develop → Vercel Preview    → preview URL (staging API)
```

**Why:** 팀원 WIP 공유 수단 부재 해소. AWS 이전 없이 Vercel 기본 기능으로 처리.

**How to apply:**
- **1인 프론트 개발 — develop이 단일 진실 브랜치, main은 prod 게이트로 develop을 따라감 (release branch pattern).**
- prod 배포는 develop의 특정 커밋을 main에 **cherry-pick** 후 push. PR 흐름은 1인 운영에 오버헤드.
- **main과 develop은 fast-forward 불가능한 상태가 정상.** 거의 모든 커밋이 양쪽에 다른 SHA로 중복 cherry-pick 형태로 존재함. `git merge --ff-only`·`git pull --ff-only`·`git rebase` 시도하지 말 것 — 곧장 cherry-pick.
- main 직접 작업 금지 (cherry-pick 한정 push만 허용).
- feature 브랜치는 PR 단위 임시. 영구 운영 브랜치는 main/develop 둘뿐.
- Vercel 환경변수 `VITE_API_BASE_URL`은 Production/Preview 환경별 분리 등록.
