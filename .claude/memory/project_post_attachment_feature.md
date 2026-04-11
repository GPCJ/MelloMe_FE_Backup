---
name: 게시글 첨부파일 업로드 기능 구현 현황
description: 프론트 구현 완료 + 400 버그 프론트 측 해결. 백엔드 PDF만 허용 중, 이미지 허용 여부 미확인.
type: project
originSessionId: 6ddff2ad-b5e4-45d6-8422-16a4eadb4382
---
프론트엔드 구현 완료 (2026-04-05). 400 에러 프론트 측 해결 완료 (2026-04-10).

## 구현 완료 항목
- `uploadPostAttachment(postId, file)` / `deletePostAttachment(postId, attachmentId)` API 함수
- `useFileAttachment` 훅 — 파일 상태, 검증(10MB/10개), ObjectURL 라이프사이클 관리
- `FilePreviewGrid` 컴포넌트 — 기존/신규 첨부파일 프리뷰 UI
- PostCreatePage — 파일 선택 → 로컬 프리뷰 → 글 저장 후 순차 업로드
- PostEditPage — 기존 첨부파일 표시/삭제 + 새 파일 추가
- PostDetailPage — 이미지 인라인 프리뷰 + 파일 다운로드 링크
- MSW 목 핸들러 추가

## 400 에러 해결 (04-10)
- 원인: 한컴 뷰어로 인한 MIME 타입 `application/haansoftpdf` 불일치
- 해결: `new Blob([file], { type: 'application/pdf' })`로 강제 지정 (커밋 867efd8)

## 백엔드 미확인 사항
- 백엔드는 현재 **PDF만** 허용 (`validatePdf()`) — 이미지 첨부 허용 여부 확인 필요
- 프론트는 이미지+모든 파일 첨부 UI가 있음 → 백엔드 방향에 따라 프론트 조정 필요
