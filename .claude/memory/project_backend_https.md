---
name: 백엔드 HTTPS 미적용 이슈
description: 배포 환경에서 HTTP 백엔드로 요청 차단됨 — 백엔드 HTTPS 적용 착수 예정
type: project
---

~~Vercel(HTTPS)에서 백엔드(`http://43.203.40.3:8080`)로 요청 시 Mixed Content 에러로 브라우저가 차단.~~

**[해결 — 2026-03-17]** `api.melonnetherapists.com` HTTPS 정상 동작 확인.
- `https://api.melonnetherapists.com/actuator/health` 접속 시 401 JSON 응답 확인 (HTTPS 정상)
- 프론트 `VITE_API_BASE_URL` → `https://api.melonnetherapists.com/api/v1` 로 변경 완료
- Vercel 환경변수도 동일하게 업데이트 필요 (또는 `/api/v1` 제거 여부 백엔드 경로 확인 후 결정)

**현재 남은 이슈:** 백엔드 CORS 미설정 — `https://www.melonnetherapists.com` 허용 요청 완료, 수정 대기 중.

**How to apply:** HTTPS 이슈는 해결됨. 이제 CORS 해결되면 로그인 테스트 가능.
