---
name: reference-swagger-staging
description: staging 환경 Swagger UI + JSON spec endpoint — 로컬 openapi-local.json 묵었을 때 정답지
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2d3bc8cc-a543-4e3e-9113-ef432a2b427b
---

staging 환경 Swagger UI / OpenAPI spec.

**URLs**
- Swagger UI: `https://api-staging.melonnetherapists.com/swagger-ui/index.html#/`
- JSON spec endpoint: `https://api-staging.melonnetherapists.com/v3/api-docs`

**언제 쓰나**
- 백엔드 응답 스키마 의문 시 (필드 존재 여부, 타입, enum 값)
- 로컬 `docs/openapi-local.json`이 묵었거나 drift 의심될 때 — staging이 더 최신일 가능성 높음

**Drift 함정 — 실제 사례 (2026-05-12)**
- 로컬 `docs/openapi-local.json` 마지막 수정 2026-04-20 (3주 묵음)
- 로컬 spec의 `TherapyPostSummaryResponse`엔 `imageUrls` 필드 없음
- staging spec엔 `imageUrls: string[]` 포함 + `curiousCount`/`usefulCount`/`accessLocked` 등 신규 필드 포함
- 사용자 지적 ("/posts/feed 응답에는 있잖아") 없었으면 백엔드에 불필요한 추가 요청 보냈을 뻔

**How to use**
- 백엔드 응답 의문 시 1차 — staging spec 먼저 확인
- staging에도 없으면 → 진짜 백엔드 작업 필요 (e.g. 첨부 칩용 `attachments` 필드)
- 가능하면 `docs/openapi-local.json` 주기적으로 staging spec으로 동기화

**관련 reference**
- [[reference-backend-swagger]] — 일반 백엔드 OpenAPI endpoint
- [[reference-swagger-endpoint]] — 기존 Swagger UI 레퍼런스
- [[reference-swagger-enum-verification]] — enum 전체 값 확인
