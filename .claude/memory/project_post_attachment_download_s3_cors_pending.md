---
name: 첨부파일 다운로드 fix 완료 + S3 CORS 검증 대기
description: 다운로드 redirect 버그 프론트 fix 완료(60a4e09 develop), staging 검증은 S3 버킷 CORS 미설정으로 차단. 백엔드 인프라 작업 대기.
type: project
originSessionId: d4577431-d681-4be7-aac5-ba2ac130d677
---
## 현재 상태 (2026-05-01)

게시글 첨부파일 다운로드 클릭 시 다운로드 안 되고 새 탭/탭 내 navigate되는 "리다이렉트" 증상에 대한 프론트 fix는 완료. staging 배포까지 됐으나 S3 버킷 CORS 미설정으로 다운로드 실제 동작은 검증 막힘.

## 변경 사항 (커밋 `60a4e09`, develop)

`PostDetailPage.tsx`:
- `axiosInstance` → raw `axios` 교체 (인터셉터의 AT 헤더 자동 부착이 presigned URL signature와 충돌해 S3가 거절했던 게 원인)
- PDF/이미지 분기(`if (isImage)`) 제거 — 모든 첨부를 `downloadAsBlob` 경로로 통일 (cross-origin `<a download>` 무시 회피)
- catch의 `window.open` 폴백 제거 (이게 "리다이렉트" 증상의 직접 원인이었음)
- stale 주석 정리

**Why:** presigned URL은 URL 자체가 인증서이므로 Bearer 헤더가 오히려 충돌을 일으킴. 백엔드 변경 없이 프론트만 고치는 옵션 A 채택.

## 블로커 — S3 버킷 CORS

코드 수정 후에도 staging에서 `axios.get(presignedS3Url)` 시 CORS 에러. 원인은 S3 응답에 `Access-Control-Allow-Origin` 헤더 부재. `<img src>` 미리보기는 CORS 면제라 동작했지만, fetch/axios는 강제됨.

**핵심**: prod 머지 의미 없음 — 같은 S3 버킷 사용하므로 동일하게 막힘.

## 백엔드에 요청할 정책 (이슈 등록 대기)

```
AllowedOrigins:
  - http://localhost:3000
  - http://localhost:5173
  - https://www.melonnetherapists.com
  - <staging Vercel URL — 확인 필요>
AllowedMethods: GET, HEAD
AllowedHeaders: *
ExposeHeaders: Content-Disposition, Content-Length, Content-Type
MaxAgeSeconds: 3600
```

staging URL은 Vercel 대시보드 또는 staging 페이지 주소창에서 확인 필요.

## 검증 시점 (S3 CORS 풀린 후)

1. staging에서 게시글 상세 진입 → 이미지/PDF 다운로드 클릭 → 저장 다이얼로그 표시 확인
2. DevTools 네트워크 탭에서 S3 요청 헤더에 `Authorization` 미부착 확인 (있으면 raw axios에 전역 인터셉터 붙어있다는 신호 → 추가 점검)
3. 통과 시 develop → main 머지 → prod 검증

**How to apply:** 백엔드 인프라 fix 알림 오면 위 검증 절차 진행. 그 전엔 추가 코드 변경 불필요. 다른 backlog 작업으로 전환 가능.
