---
name: reference-backend-openapi-schema-naming
description: 멜로미 백엔드 OpenAPI(staging) schema 명명은 FE 타입과 다름 — TherapyPost prefix. Swagger 조회 시 schema 이름 추측 회피용 매핑.
metadata:
  type: reference
  originSessionId: e6719f80-10c5-489c-afe5-fb6b595f6c5d
---

staging Swagger OpenAPI JSON(`https://api-staging.melonnetherapists.com/v3/api-docs`) 조회 시 schema 이름이 FE 타입명과 다르므로 grep할 때 주의. 백엔드 클래스는 `TherapyPost` prefix 패턴.

**FE 타입 ↔ 백엔드 schema 매핑**:

| 용도 | FE (`frontend/src/types/post.ts`) | 백엔드 schema |
|---|---|---|
| 작성 요청 (POST /api/v1/posts) | `PostCreateRequest` | `CreateTherapyPostRequest` |
| 수정 요청 (PATCH /api/v1/posts/{id}) | `PostUpdateRequest` | `UpdateTherapyPostRequest` (postType 불변 정책으로 미포함) |
| 피드 응답 항목 | `PostSummary` | `TherapyPostSummaryResponse` |
| 상세 응답 | `PostDetail` | `TherapyPostDetailResponse` |

**flat 필드 모두 포함 (2026-05-29 staging 실측 확정)**:
- 모든 schema에 `ageGroup`, `diagnoses`, `otherNotes` 포함
- enum 정합: `postType`(COMMUNITY/RESOURCE/CONCERN_CARD), `ageGroup`(UNSPECIFIED + AGE_0_2~AGE_65_PLUS), `therapyArea`(10종), `visibility`(PUBLIC/PRIVATE/FOLLOWERS_ONLY/VERIFIED_FOLLOWERS_ONLY) — 모두 FE 가정과 일치
- 제약: `diagnoses.maxItems: 10`, `diagnoses.items.maxLength: 100`, `diagnoses.items.minLength: 0`(빈 문자열 허용 — FE에서 trim 가드 필요)
- `GET /api/v1/posts`에 `?postType=` query 지원(필터 탭 백로그 후보)

**사용 패턴**:
- staging OpenAPI 조회 = curl로 JSON 받아 python3로 schema 파싱(jq 미설치 환경 가정)
- FE에 새 필드 추가 검토 시 백엔드 schema 이름으로 grep해서 ground truth 확인
- schema 이름이 다른 프로젝트로 전파될 수 있으니 `Therapy` prefix 패턴 인지

관련: [[reference_swagger_endpoint]], [[reference_backend_swagger]].
