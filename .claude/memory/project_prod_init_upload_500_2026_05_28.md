---
name: project_prod_init_upload_500_2026_05_28
description: "prod 전용 POST /posts/{id}/uploads/init 500 (INTERNAL_SERVER_ERROR) — staging 정상, presigned 발급 인프라 회귀 추정, FE 무책임"
metadata: 
  node_type: memory
  type: project
  originSessionId: e46840d8-0d58-410a-acd9-c91ce82d1c42
---

2026-05-28 발견. 운영(prod)에서 이미지 첨부 시 `POST /api/v1/posts/{postId}/uploads/init`가 **500**. **staging은 정상**(동일 파일 업로드 성공) → **prod 전용 환경/인프라 회귀**.

## 진단 (확정)
- 응답: `{code:"INTERNAL_SERVER_ERROR", message:"서버 내부 오류가 발생했습니다.", status:500, fieldErrors:null}`
- 요청 페이로드 완벽 정상: `{kind:"IMAGE", originalFilename:"…png", contentType:"image/png", sizeBytes:182572}` — 스펙(`UploadInitRequest`) 준수, contentType 비어있지 않음.
- Authorization Bearer 존재(401 아님), CORS 헤더 정상(CORS 아님), `fieldErrors:null`(검증 실패 아님).
- staging/prod Swagger init 스펙 **완전 동일** → 계약 회귀 아님, 런타임 문제.
- **FE 책임 0.** init은 presigned S3 PUT URL 발급만 함 → prod의 S3 자격증명/IAM·버킷 env 설정 깨짐이 1순위.

## 04-29 건과 구별 ([[project_image_upload_500_file_storage_error]])
다른 이슈임. 04-29는 `/posts/{id}/images`(구 multipart)·`FILE_STORAGE_ERROR`·**staging도 500**(코드 회귀). 이번은 `/uploads/init`·`INTERNAL_SERVER_ERROR`·**staging 정상**(prod 환경 전용). 공통점은 S3 저장 계열뿐, 결론 반대.

## 액션
- 백엔드(아이로) 이슈 = Jira MEL. 500 스택트레이스는 prod EC2 로그에만 → 백엔드만 root cause 확인 가능.
- 백엔드에 요청: prod의 S3/presigned 관련 env·IAM·버킷 설정을 staging과 diff. 최근 prod 배포/인프라 변경 커밋 우선 검토.
- 재시도 로직과 무관: init은 재시도 루프 바깥(`posts.ts:190`)이라 500 즉시 실패. [[project_image_upload_retry_idempotency_design]]

## Root cause 추적 (백엔드/클라우드 확인, 2026-05-28)
- **1차 가설(남다경, 백엔드)**: Redis 설정 추가 중 이전엔 묻혀있던 실패가 명확히 에러로 드러남. "일단 고쳐놨다" — 단 fix의 prod 배포 여부 별건.
- **윤찬호(백엔드)**: 해당 작업 아직 운영 배포 전.
- **2차 확인 후(2026-05-28 오전)**: 운영에서 **같은 500 재현 지속**. 클라우드/인프라팀: 원인 추적 중인데 해결 안 되는 것 보면 인프라 문제는 아닌 것 같다고 함. → root cause는 **백엔드 코드 경로**로 수렴 중, 미해결 상태.

## 백엔드 측 요청·인수인계 사항 (2026-05-28)
- **백엔드 요청**: 이미지 첨부 관련 서버 4xx~5xx 실패 응답을 **프론트에서 다 로깅** 해두기 원함 → FE 통신 실패 로깅 정비 과제 [[backlog]] 후속.
- **재시도(client-side)**: 백엔드가 별도 구상 있음 → **추후 인수인계 예정**. 현재 prod에 머지된 재시도 로직([[project_cherry_pick_retry_logging_to_main_2026_05_28]])은 백엔드 구상과 정합 맞춰갈 필요. **추가 재시도 작업 보류 — 백엔드 인수인계 대기.**

**Why:** staging 정상이지만 백엔드 fix 미배포·인프라팀 무관 → 백엔드 코드 path 미수렴. FE 재시도도 백엔드 idempotency·중복 방지 계약과 정합돼야 함.
**How to apply:** prod 이미지 업로드 막힘 — 백엔드 fix prod 배포 후 FE 재현 확인. FE 측 액션 2건: (1) 통신 실패 로깅 정비 (2) 백엔드 재시도 구상 수령 후 정렬.
