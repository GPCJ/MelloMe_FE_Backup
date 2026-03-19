---
name: 다음 세션 리마인드 (2026-03-21)
description: 2026-03-20 작업 종료 시 내일 확인 요청한 항목들
type: project
---

## 내일 확인할 것

1. **`GET /me` 실제 동작 확인** — yaml에는 구현되어 있음. 실제 백엔드 호출 시 응답 오는지 확인 필요
2. **프론트 로그인 인터셉터 수정** — 로그인 응답은 `{ isNewUser, user, tokens }` 래퍼 없는 형태. axios 인터셉터에서 로그인 엔드포인트는 언래핑 제외 처리 필요
3. **CORS 반영 여부 확인** — 반영되면: vercel.json 프록시 제거 + `VITE_API_BASE_URL` → `https://api.melonnetherapists.com/api/v1` 변경
4. **마이페이지 API** — `GET /me/dashboard`, `GET /me/posts`, `GET /me/activity` 백엔드 구현 예정 없는지 확인

**Why:** 2026-03-20 세션 종료 시 사용자가 다음날 리마인드 요청

**How to apply:** 다음 대화 시작 시 이 항목들 먼저 알려줄 것.
