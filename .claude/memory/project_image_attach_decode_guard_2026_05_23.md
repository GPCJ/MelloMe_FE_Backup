---
name: project_image_attach_decode_guard_2026_05_23
description: "게시글 이미지 첨부 누락 버그 — 디코드 가드 추가(원인 미확정, 관측 대기) + 백엔드 트랙"
metadata: 
  node_type: memory
  type: project
  originSessionId: dbc1c4bd-f9e0-41fa-9480-c38196ff814e
---

게시글 작성 시 이미지 첨부가 **에러 없이 누락**되는 버그 리포트(모바일 삼성브라우저, 갤러리 로컬 사진). 미리보기 UI는 떴으나 사진 안 보임 → 작성 완료 시 알림 없이 첨부 0개(읽기 A). 같은 환경 재첨부 시 정상.

**원인은 미확정(추측):** 모바일이 `file.size` 메타데이터는 정상인데 **실제 바이트가 비어/덜 찬 File**을 넘긴 것으로 추정. 빈 PUT을 S3가 200으로 받아 throw 없음 → 기존 `failedCount` alert도 안 뜸(=silent). 실물 파일은 정상 JPEG라 데스크탑 재현 불가, 간헐적.

**조치 (커밋 `14ac498` develop / `026f302` main cherry-pick, 2026-05-23):** `useFileAttachment.ts` `addFiles`를 async로 바꿔 이미지 선택 시 `img.decode()`로 렌더 가능 여부 검증. 실패 시 `pendingFiles`에 추가 안 하고 "이미지를 불러오지 못했어요. 다시 첨부해 주세요" 안내. 빈/완전 깨진 File은 잡지만 **부분 디코드되는 truncated 이미지는 샐 수 있음**(브라우저 의존).

**미해결 / 다음:**
- 가설 검증 안 됨 → **재발 관측 중**. 재발 시 프론트 `file.size`/`type` 로그 + 백엔드 로그 필요.
- **백엔드 트랙**: confirm 2xx인데 이미지가 `/posts/{id}/images`에 미등록되는 silent 경로 — 영속화 확인 필요. 프론트 디코드 가드와 별개.

기존 swallow 정책은 [[feedback_error_handling]] 참고. 첨부 업로드 3단계(init→S3 PUT→confirm)는 [[project_post_attachment_feature]].
