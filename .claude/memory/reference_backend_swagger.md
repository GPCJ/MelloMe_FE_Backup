---
name: 백엔드 Swagger UI / OpenAPI 스펙 위치
description: MelloMe 백엔드 API 스펙 조회 경로 — 엔드포인트/스키마 확인이 필요할 때 스냅샷 대신 WebFetch로 fresh 조회
type: reference
originSessionId: fc63365f-4f62-4e60-a6f0-3b421396220f
---
- **Swagger UI (사람용)**: https://api.melonnetherapists.com/swagger-ui/index.html
- **OpenAPI JSON (도구용, fetch 대상)**: https://api.melonnetherapists.com/v3/api-docs
- **API prefix**: `/api/v1` (예: `/api/v1/posts/{postId}/attachments`)
- **인증**: 대부분 엔드포인트 Bearer JWT 필요. 스펙 문서 자체는 공개로 접근 가능.

**사용 원칙**
- 스냅샷 문서를 레포에 저장하지 않는다(백엔드 변경이 잦아 낡음). 필요할 때마다 위 JSON을 `WebFetch`로 당겨서 최신 스펙 기준으로 판단.
- 프론트 엔드포인트 경로 가정이나 응답 필드 가정이 헷갈릴 때 첫 번째 확인처.
