---
name: 루트 .env → .env.docker 이름 변경
description: Docker Compose용 env 파일을 .env.docker로 변경한 이력 — 관련 오류 발생 시 참고
type: project
---

루트 `.env`를 `.env.docker`로 이름 변경함 (2026-03-20).

**Why:** 프론트엔드 `frontend/.env`(Vite용)와 루트 `.env`(Docker Compose용)가 둘 다 `.env`라 헷갈려서 구분을 위해 변경.

**How to apply:** Docker Compose 실행 시 반드시 `--env-file` 옵션 명시 필요.

```bash
# 변경 전
docker compose up

# 변경 후
docker compose --env-file .env.docker up
```

Docker 관련 오류(환경변수 못 읽음, DB 연결 실패 등) 발생 시 이 변경사항부터 확인할 것.
