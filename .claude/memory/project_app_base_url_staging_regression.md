---
name: APP_BASE_URL 회귀 — 해소 (2026-05-04)
description: 04-30 staging/prod 양쪽에서 04-22 버그 회귀 발생 → 백엔드 환경변수 재주입으로 해소
type: project
originSessionId: a3e21c89-2615-4076-a3c0-0add52889b06
resolved: 2026-05-04
---
## 상태: 해소 (2026-05-04, 백엔드 조치 완료)

같은 root cause로 두 번 재발한 사례 — `APP_BASE_URL` 누락은 인프라 회귀 패턴으로 박제.

**Why 박제**: 04-22 1차 fix → 04-30 회귀(staging EC2 IP / prod localhost) → 05-04 2차 fix. 재배포·환경 재구성 시 환경변수 유실 가능성이 입증됨. 다음에 같은 증상이 또 보이면 이 메모리부터 참조 + 백엔드 환경변수 누락을 먼저 의심.

**How to apply**: 프론트 코드 변경 제안 전에 백엔드 `APP_BASE_URL` 주입 상태를 확인할 것. 핫픽스 옵션 카드: `b66aefd` cherry-pick (`resolveImageUrl`에서 강제 치환, GET 응답만 가림 — 신규 업로드 500은 못 막음).

## 회귀 현상 (참고용 박제)
- prod: `GET /me.profileImageUrl` → `http://localhost:8080/...` (ERR_CONNECTION_REFUSED)
- staging: `http://43.201.120.96:8080/...` (raw EC2 IP + HTTP)
- 동반: `POST /me/profile-image` 500 `FILE_STORAGE_ERROR`

근거 wiki: `url-localhost-app-base-url-2026-04-22`
