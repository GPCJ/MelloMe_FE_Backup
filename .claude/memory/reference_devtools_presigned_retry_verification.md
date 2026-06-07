---
name: reference_devtools_presigned_retry_verification
description: presigned 업로드의 재시도/실패 경로를 DevTools Request blocking으로 검증하는 기법 — S3 PUT만 URLPattern으로 차단
metadata: 
  node_type: memory
  type: reference
  originSessionId: cd194f59-96fe-4948-9929-c48e17ae855e
---

presigned 3단계 업로드(init → S3 PUT → confirm)의 **재시도/실패 경로**를 staging(MSW off)에서 검증하는 방법. 2026-05-26 이미지 재시도 구현 검증 시 정립.

## 방법
- DevTools → `Cmd/Ctrl+Shift+P` → "Show Request blocking" → 패턴 추가 + "Enable blocking and throttling" 체크.
- **S3 PUT만 차단**한다. init은 백엔드 호스트라 안 걸려 → 루프 진입(storedKey 발급)이 보장됨. (완전 오프라인은 init부터 터져서 재시도 루프를 못 봄.)

## 함정 2가지
1. **전체 URL 차단은 무의미** — presigned URL은 매 init마다 쿼리스트링(`?X-Amz-Signature=...`)·객체키(UUID)가 바뀜. **고정 호스트만** 패턴으로 잡아야 매 업로드가 계속 걸림.
   - dev 버킷 호스트: `melonne-therapists-bucket-dev.s3.ap-northeast-2.amazonaws.com` (출처 [[project_post_attachment_download_s3_cors_pending]])
2. **최신 Chrome은 URLPattern 문법** — `*host*` 같은 와일드카드 substring은 "failed to parse as a URLPattern" 에러. 유효 URL 형태로: `https://<bucket-host>/*` (경로는 `/*`, 쿼리는 미지정 시 자동 와일드카드).

## 관찰 포인트
- 마지막 시도는 `if (attempt === maxAttempts) throw err`가 `console.warn`보다 먼저 실행 → **재시도 로그는 (maxAttempts − 1)회**만 찍힘(3회 설계면 attempt 1·2만). 최종 실패는 호출부 catch의 alert로 확인.

**How to apply:** 향후 presigned 업로드/다운로드의 재시도·타임아웃·만료 폴백을 손볼 때 동일 기법으로 강제 실패 재현. 구현 맥락은 [[project_image_upload_retry_idempotency_design]].
