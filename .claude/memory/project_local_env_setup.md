---
name: 로컬 개발 환경 세팅 미완료
description: 루트 .env 파일 미생성으로 docker-compose 실행 불가 상태
type: project
---

루트 `/my-project/.env` 파일이 없어 docker-compose(DB + 백엔드) 실행 불가 상태.

**Why:** 개발 환경 세팅 중 작업 중단됨 (2026-03-17)

**필요한 환경 변수:**
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — 로컬 dev용 임의 값으로 생성 가능
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — 랜덤 문자열로 생성 가능
- `CORS_ALLOWED_ORIGINS` — `http://localhost:5173`으로 설정 가능
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — 사용자가 Google Cloud Console에서 직접 제공해야 함

**How to apply:** 다음 대화에서 로컬 환경 세팅 이어할 때, GOOGLE_CLIENT_ID/SECRET만 받으면 나머지는 바로 `.env` 생성 가능.

참고: MSW 환경에서 Google 로그인 테스트 시 dummy Client ID 사용 가능 (실제 OAuth 플로우 불필요).
