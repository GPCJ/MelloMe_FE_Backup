---
name: 백엔드 Swagger UI 및 OpenAPI 스펙 접근 정보
description: 백엔드 Swagger UI 주소와 OpenAPI JSON 저장 명령어
type: reference
originSessionId: 0f387c22-21f4-45b8-9bda-16b32dc45d65
---
- **prod** Swagger UI: `https://api.melonnetherapists.com/swagger-ui/index.html`
- **staging** Swagger UI: `https://api-staging.melonnetherapists.com/swagger-ui/index.html`
- **staging** OpenAPI JSON: `https://api-staging.melonnetherapists.com/v3/api-docs` (가장 최신 스펙, develop 기준)
- prod OpenAPI JSON 저장: `curl -s https://api.melonnetherapists.com/v3/api-docs > docs/openapi-local.json`
- 저장 위치: `docs/openapi-local.json`
- 프론트 참고용 정리: `docs/api-reference.md`
- 작업 시 우선 참조 = staging (develop 머지된 최신 백엔드 상태)
