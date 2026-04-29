---
name: 브랜치 정책 — main(prod) + develop(staging)
description: 네이밍은 main(master 금지). 운영은 main/develop 2브랜치(Vercel prod/preview 매핑).
type: feedback
updated: 2026-04-29
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
- 일상 작업은 develop. preview 검증 후 main으로 merge.
- main 직접 push 금지 (PR/merge 경로만).
- feature 브랜치는 PR 단위 임시. 영구 운영 브랜치는 main/develop 둘뿐.
- Vercel 환경변수 `VITE_API_BASE_URL`은 Production/Preview 환경별 분리 등록.
