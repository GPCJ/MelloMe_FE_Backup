---
name: 게시글 첨부파일 업로드 400 에러
description: MIME 타입 불일치(application/haansoftpdf)가 원인, 프론트 Blob 강제 지정으로 해결 완료
type: project
originSessionId: 6ddff2ad-b5e4-45d6-8422-16a4eadb4382
---
`POST /posts/{postId}/attachments` 에 파일 업로드 시 400 "유효하지 않은 첨부 파일입니다." (04-06 발견 → 04-10 해결)

## 원인 (04-10 확정)
- 백엔드 `validatePdf()`가 `application/pdf`만 허용
- 한컴 뷰어 설치 환경에서 OS가 `.pdf`의 MIME 타입을 `application/haansoftpdf`로 등록
- 브라우저가 OS MIME 매핑을 그대로 전송 → 백엔드 검증 실패
- Swagger curl 복사로 `type=application/haansoftpdf` 확인하여 발견

## 프론트 해결 (커밋 867efd8)
- `api/posts.ts` — `new Blob([file], { type: 'application/pdf' })`로 MIME 타입 강제 지정

## 백엔드 요청
- airo 이슈 #9 코멘트로 원인 공유 완료
- `ALLOWED_POST_ATTACHMENT_MIME_TYPES`에 `application/haansoftpdf` 추가 요청
- 게시글 첨부파일 이미지 허용 여부도 확인 필요 (현재 PDF만 허용)
