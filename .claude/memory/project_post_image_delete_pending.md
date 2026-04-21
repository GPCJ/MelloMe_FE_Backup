---
name: 게시물 이미지 DELETE 엔드포인트 백엔드 응답 대기
description: /posts/{postId}/images/{imageId} DELETE가 백엔드 Swagger에 없음 — 백엔드에 추가 요청 완료, 응답 대기 중. 응답 오면 프론트 deletePostImage API + PostEditPage UI 활성화 필요
type: project
originSessionId: 08bef002-5c19-4a76-8951-5c27bc960427
---
게시물 이미지 삭제 API가 현재 백엔드에 없음. `api.melonnetherapists.com/v3/api-docs` 확인 시 `POST /posts/{id}/images`, `GET /posts/{id}/images`만 있고 DELETE 미구현. 백엔드에 추가 요청해둔 상태로 응답 대기 중(2026-04-20).

**2026-04-21 Swagger 재확인** — 여전히 DELETE 미존재. PostImageResponse 필드 공식 확정(`id, imageUrl, originalFilename, displayOrder, createdAt`).

**2026-04-22** — 백엔드 개발 완료, PR 대기 중(아직 merge/배포 전). 머지+배포 확인 후 프론트 연결 작업 진행.

프론트 현재 처리:
- `PostEditPage`에서 기존 이미지 X 버튼 미노출(삭제 불가).
- `FilePreviewGrid`의 `existingImages` prop은 읽기 전용으로 렌더, tooltip으로 "이미지 삭제는 아직 지원되지 않습니다" 안내.
- `api/posts.ts`에 `// TODO: 백엔드에 이미지 DELETE 엔드포인트 추가 요청 후 구현 예정` 주석.

**Why:** 이미지 업로드 미반영 이슈(`3a74732`, `fed2feb` 커밋) 해결 중 확인한 후속 블로킹 항목. 후속 세션에서 중복 조사/재구현을 피하고 백엔드 응답 확인 후 바로 이어 작업할 수 있도록 상태 저장.

**How to apply**
- 이미지 삭제 관련 요구가 들어오면 먼저 Swagger/백엔드 상태 재확인 (`WebFetch /v3/api-docs`).
- DELETE 엔드포인트 추가가 확인되면: `deletePostImage(postId, imageId)` 추가 → `FilePreviewGrid`에 `onRemoveImage` prop 연결 → `PostEditPage`에서 삭제 플로우 활성화 → `useFileAttachment`의 `remainingExisting` 계산에서 제거된 이미지 반영.
- 이미지/PDF 업로드 엔드포인트 분리 작업과 혼동하지 말 것 (해당 건은 `project_post_attachment_endpoints_split.md` 참고).
