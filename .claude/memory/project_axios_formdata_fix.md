---
name: axiosInstance FormData Content-Type 버그 수정
description: 기본 Content-Type application/json이 FormData를 JSON으로 직렬화하던 버그 수정
type: project
---

axiosInstance에 `Content-Type: application/json` 기본 헤더가 설정돼 있어서, FormData를 보내도 `{"file":{}}` JSON으로 직렬화되는 버그가 있었음.

## 증상
- `POST /posts/{postId}/attachments` 요청이 `Content-Type: application/json`, body `{"file":{}}` 으로 전송
- 서버에서 500 에러 반환

## 수정 내용
`axiosInstance.interceptors.request` 인터셉터에 FormData 감지 로직 추가:

```ts
if (config.data instanceof FormData) {
  delete config.headers['Content-Type']
}
```

Content-Type 삭제 시 브라우저가 `multipart/form-data; boundary=...` 자동 설정.

## 영향 범위
프로필 이미지 업로드(`auth.ts`), 치료사 인증(`therapist-verifications`) 등 기존 multipart 요청도 동일 패턴이었음. 인터셉터 수정으로 일괄 해결.

**Why:** 기존 업로드 함수들이 수동으로 `Content-Type: multipart/form-data` 헤더를 설정했는데, boundary 없이 설정하면 일부 서버에서 파싱 실패 가능성 있었음.
**How to apply:** 향후 multipart 요청 추가 시 별도 헤더 설정 불필요. 인터셉터가 자동 처리.
