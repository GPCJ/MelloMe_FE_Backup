---
name: 게시글 첨부파일 업로드 400 에러
description: POST /posts/{postId}/attachments Swagger에서도 실패, airo 이슈 #9 등록
type: project
---

`POST /posts/{postId}/attachments` 에 파일 업로드 시 400 "유효하지 않은 첨부 파일입니다." (04-06)

- Swagger UI에서도 동일하게 실패 → 백엔드 문제 확정
- 같은 파일로 `POST /me/profile-image`는 정상 업로드됨
- 프론트 요청 형식 (FormData, 필드명 "file") 문제 없음 확인 완료

**Why:** 두 엔드포인트의 파일 검증 로직 차이 (허용 타입, 크기, 파라미터명 등)
**How to apply:** AIRO-offical/therapist_community_FE#9 이슈로 등록 완료 (상위 이슈 #6). 백엔드 수정 대기 중. 기존 #8 이슈와 별개.
