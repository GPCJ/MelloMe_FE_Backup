---
name: CORS 프록시 설정 현황
description: 백엔드 CORS 반영 완료 — vercel.json 프록시 제거 완료, Vercel 환경변수 변경 대기 중
type: project
---

Vercel 프록시는 CORS를 우회하지 못함. 프록시로 요청을 전달해도 브라우저의 `Origin` 헤더가 그대로 백엔드로 전달되어 백엔드가 CORS 체크를 하기 때문.

**현재 상태 (2026-03-20):**
- 백엔드 CORS 반영 완료 ✅ (`https://www.melonnetherapists.com` 허용)
- `vercel.json` API 프록시 rewrite 제거 완료 ✅ (SPA 라우팅 rewrite만 유지)
- **[대기 중]** Vercel 대시보드에서 `VITE_API_BASE_URL` `/api` → `https://api.melonnetherapists.com/api/v1` 변경 + 재배포 필요
- 백엔드 circular reference 이슈 해결된 것으로 보임 ✅ — 로그인 테스트 진행 예정

**Why:** 프록시는 불필요한 복잡도. 백엔드 CORS 설정이 근본 해결책.

**How to apply:** 다음 세션 시작 시 Vercel 환경변수 변경 + 재배포 리마인드할 것.
