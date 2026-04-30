---
name: APP_BASE_URL staging 회귀 (2026-04-30)
description: staging 백엔드에서 04-22 localhost 버그가 EC2 IP 형태로 재발 — 프로필 이미지 URL이 raw IP+HTTP로 응답
type: project
originSessionId: a3e21c89-2615-4076-a3c0-0add52889b06
---
**현상**: `POST https://api-staging.melonnetherapists.com/api/v1/me/profile-image` 응답의 `profileImageUrl`이 `http://43.201.120.96:8080/...` (raw EC2 IP + HTTP)로 내려옴.

**Why**: 스프링 백엔드가 staging 환경에서 `APP_BASE_URL` 환경변수를 못 읽어 서버 자기 IP+포트를 fallback으로 사용. 04-22 prod localhost 버그(wiki `url-localhost-app-base-url-2026-04-22`)와 동일 root cause, 환경만 prod→staging, fallback만 localhost→EC2 IP로 변형.

**How to apply**: 백엔드가 해결한 뒤 사용자가 명시적으로 삭제 요청할 때까지 보존. 같은 증상이 다시 보고되면 이 메모리부터 참조하고, 프론트 코드 변경 제안 전에 백엔드 환경변수 누락을 먼저 의심할 것. 핫픽스 옵션은 `b66aefd` cherry-pick으로 `resolveImageUrl`에서 강제 치환(GET 응답만 가림, 신규 업로드 시 DB 박제는 못 막음).
