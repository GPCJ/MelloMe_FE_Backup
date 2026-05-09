---
name: MEL-44 presigned 업로드 전환 완료
description: MEL-44 프론트엔드 presigned 3단계 업로드 흐름 전환 완료 현황 및 잔여 이슈
type: project
originSessionId: 29c5af29-908e-4a82-a170-04b08e357dbb
---
MEL-44 프론트엔드 작업 완료 (2026-05-09). PR #9 → develop 머지, Jira 완료 처리.

**Why:** 백엔드 PR #99에서 multipart → presigned URL 3단계 흐름으로 업로드 방식 변경됨. FE 전환 필수.

**How to apply:** 업로드 관련 이슈 발생 시 새 흐름(init→S3 PUT→confirm) 기준으로 디버깅.

## 변경 요약
- `api/posts.ts`: `initUpload` / `uploadToS3`(raw axios) / `confirmUpload` 추가
- `useFileAttachment`: `PendingFile.kind` 추가, HWP·docx·xlsx 허용, 이미지 10MB·첨부 50MB, 개수 분리(이미지 10장/첨부 5개)
- `PostCreatePage` / `PostEditPage`: handleSubmit 업로드 로직 교체

## 잔여 이슈
- `GET /posts/{postId}/images`가 presigned 흐름으로 올린 이미지를 반환하는지 미확인 → 편집 화면 기존 이미지 카운트에 영향 가능성
- 기존 이미지 삭제 불가 (백엔드 DELETE 엔드포인트 미구현) — `posts.ts` TODO 유지 중
