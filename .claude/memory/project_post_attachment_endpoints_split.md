---
name: 첨부파일 업로드 이미지/PDF 엔드포인트 분리
description: 프론트 분리 1차 구현 완료, 이미지 상세 조회 로직 미구현 상태 — 상세 페이지에서 이미지 렌더링 안 됨 이슈 남음
type: project
originSessionId: fc63365f-4f62-4e60-a6f0-3b421396220f
---
2026-04-20 커밋 `bb7e352`로 프론트 1차 대응 완료. 실서버 테스트에서 이미지 미반영 이슈 발견, Swagger 조사로 원인 확정.

**완료된 변경**
- `api/posts.ts`: `uploadPostAttachment` 제거, `uploadPostPdf` (POST `/posts/:postId/attachments`) + `uploadPostImage` (POST `/posts/:postId/images`) 분리
- MIME 강제 변환 제거 — 원본 `File`을 FormData에 그대로 append
- `hooks/useFileAttachment.ts`: `FILE_ACCEPT` 상수, `isImageFile` export, 이미지·PDF 외 파일 `addFiles`에서 차단
- `PostCreatePage`/`PostEditPage`: 단일 루프 + 파일별 확장자 분기
- `mocks/handlers/attachments.handlers.ts`: 이미지 엔드포인트 핸들러 추가

**Swagger 조사 결과 (2026-04-20)**
- **API prefix**: 실제는 `/api/v1/posts/...` (프론트가 `/posts/...`로 요청 중인지 baseURL 확인 필요)
- **이미지는 별도 리소스**: `GET /posts/:postId` 응답에는 `attachments[]`만 포함, 이미지는 `GET /posts/:postId/images`로 별도 조회 필요
- **스키마 차이**:
  - Attachments: `id, originalFilename, contentType, sizeBytes, extension, downloadUrl, createdAt`
  - Images: `id, imageUrl, originalFilename, displayOrder, createdAt` (downloadUrl/contentType/sizeBytes 없음)
- **제약 차이**: 이미지는 jpg/png/webp ≤5MB (gif 미허용), 첨부는 10MB
- **사이드 이펙트**: 첨부 업로드 시 postType COMMUNITY→RESOURCE 자동 전환, 마지막 첨부 삭제 시 COMMUNITY 복귀
- **불확실**: 이미지 삭제 엔드포인트는 Swagger에 보이지 않음 (GET만 있음) — 백엔드 확인 필요

**Why:** 백엔드가 PDF 전용/이미지 전용으로 엔드포인트 및 저장 구조를 분리. 프론트는 업로드는 대응 완료했으나 상세 조회가 단일 엔드포인트만 사용해 이미지가 표시되지 않음.

**How to apply — 남은 작업 (다음 세션 이어감, notepad priority 동기화됨)**
1. `PostDetailPage`: `GET /posts/:postId/images` 병렬 호출, 첨부/이미지 합쳐 표시
2. `api/posts.ts`: `fetchPostImages(postId)` + `PostImage` 타입 추가
3. `axiosInstance` baseURL이 `/api/v1` 포함하는지 확인, 미포함이면 수정 또는 엔드포인트 경로 수정
4. `useFileAttachment`: 이미지 5MB/PDF 10MB 분기, `IMAGE_TYPES`에서 `image/gif` 제거
5. 백엔드 컨펌: 이미지 삭제 엔드포인트 경로 — 분리돼 있으면 `PostEditPage` 삭제 루프에도 분기 추가

**테스트 파일 위치:** `/home/jin24/mello-test-files/`
