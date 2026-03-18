---
name: 백엔드 HTTPS 적용 완료
description: 백엔드 HTTPS 적용 완료 (2026-03-18). 현재 CORS 이슈 남아있음.
type: project
---

**[완료 — 2026-03-18]** 백엔드 서버 복구 및 HTTPS 적용 완료. `api.melonnetherapists.com` 접근 가능.

현재 남은 이슈: 백엔드 CORS 설정에 `https://www.melonnetherapists.com` 추가됐으나 컨테이너 재시작 여부 불확실. 프론트에서 Vercel 프록시로 임시 우회 중 (WSL2 변경사항 맥북 미동기화 — project_cors_proxy.md 참조).

**Why:** Vercel은 HTTPS, 백엔드는 HTTP라 브라우저 보안 정책에 의해 차단됐었음. HTTPS 적용으로 Mixed Content 문제 해결.

**How to apply:** HTTPS는 해결됨. 남은 작업은 CORS 정상화 확인 후 로그인 테스트.
