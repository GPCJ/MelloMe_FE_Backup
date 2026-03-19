---
name: CORS 프록시 설정 현황
description: Vercel 프록시 CORS 우회 불가 확인 — 백엔드 CORS 설정 완료 후 프록시 제거 예정
type: project
---

Vercel 프록시는 CORS를 우회하지 못함. 프록시로 요청을 전달해도 브라우저의 `Origin` 헤더가 그대로 백엔드로 전달되어 백엔드가 CORS 체크를 하기 때문.

**현재 상태 (2026-03-19):**
- `VITE_API_BASE_URL=/api` (Vercel 환경변수) — 프록시 경유 중
- 백엔드에서 `Invalid CORS request` 반환 중
- 백엔드에 `allowedOrigins: https://www.melonnetherapists.com` + `allowCredentials: true` 추가 문의 완료, 답변 대기 중

**백엔드 CORS 완료되면 할 것:**
1. `vercel.json` 프록시 rewrite 제거 (SPA 라우팅용 `/(.*) → /index.html`은 유지)
2. Vercel 환경변수 `VITE_API_BASE_URL` → `https://api.melonnetherapists.com/api/v1`

**Why:** 프록시는 불필요한 복잡도. 백엔드 CORS 설정이 근본 해결책.

**How to apply:** 백엔드 CORS 완료 답변 오면 위 두 가지 바로 적용 후 로그인 테스트.
