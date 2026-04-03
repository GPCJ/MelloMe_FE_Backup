---
name: 로컬 CORS 허용 요청 검토 중
description: 현재 Vercel URL만 CORS 허용 → 로컬 테스트 불가, localhost:5173 허용 백엔드 요청 검토
type: project
---

현재 백��드 CORS가 Vercel 배포 URL만 허용하여 로컬에서 API 테스트 불가. 매번 push → Vercel 배포 후 테스트해야 함.

**Why:** 불필요한 커밋/push 반복, 피드백 루프 느림.

**How to apply:** 백엔드에 `localhost:5173` CORS 허용 요청. 개발 환경에서만 허용하면 보안 이슈 없음.
