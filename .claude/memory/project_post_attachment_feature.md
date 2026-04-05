---
name: 게시글 첨부파일 업로드 기능 구현 현황
description: 프론트 구현 완료, 백엔드 400 버그 대기 중
type: project
---

프론트엔드 구현 완료 (2026-04-05). 백엔드 이슈 해결 후 실제 업로드 테스트 필요.

## 구현 완료 항목
- `uploadPostAttachment(postId, file)` / `deletePostAttachment(postId, attachmentId)` API 함수
- `useFileAttachment` 훅 — 파일 상태, 검증(10MB/10개), ObjectURL 라이프사이클 관리
- `FilePreviewGrid` 컴포넌트 — 기존/신규 첨부파일 프리뷰 UI
- PostCreatePage — 파일 선택 → 로컬 프리뷰 → 글 저장 후 순차 업로드
- PostEditPage — 기존 첨부파일 표시/삭제 + 새 파일 추가
- PostDetailPage — 이미지 인라인 프리뷰 + 파일 다운로드 링크
- MSW 목 핸들러 추가

## 백엔드 이슈 대기
- `POST /posts/{postId}/attachments` → 400 `INVALID_POST_ATTACHMENT`
- Swagger 직접 호출해도 동일 에러 → 백엔드 버그 확정
- **airo 이슈 #8** 등록 완료: https://github.com/AIRO-offical/therapist_community_FE/issues/8

**Why:** 백엔드 수정 전까지 실 업로드 테스트 불가. MSW로 UI 동작만 확인 가능.
**How to apply:** 백엔드 픽스 후 실서버 업로드 테스트 진행.
