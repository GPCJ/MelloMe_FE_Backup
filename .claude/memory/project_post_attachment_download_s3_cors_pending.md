---
name: 첨부파일 다운로드 prod 머지 완료 + S3 CORS 인프라 재조치 대기
description: 다운로드 fix prod까지 적용(PR#8, b6deca5). dev/prod 양쪽 CORS 에러 잔존 → 인프라 개발자 재조치 대기. 이전 "prod 머지 의미 없음" 결론 정정.
type: project
originSessionId: d4577431-d681-4be7-aac5-ba2ac130d677
---
## 현재 상태 (2026-05-02)

게시글 첨부파일 다운로드 fix가 develop → main 머지로 prod에도 적용 완료. 그러나 staging/prod 양쪽에서 CORS 에러가 동일하게 잔존 → S3 버킷 CORS 인프라 작업이 미완료(또는 잘못 적용)된 상태.

## 머지 이력

- PR #8 (rebase merge): develop → main, 12 커밋 prod 반영
- main HEAD: `b6deca5`
- download fix 새 SHA (rebase 후): `a0d3c78` (원래 develop의 `60a4e09`)
- airo 레포(`AIRO-offical/therapist_community_FE`)도 동기화 완료
- Vercel prod 자동 배포 완료

## 프론트 코드 상태

`PostDetailPage.tsx` 다운로드 로직은 CORS만 풀리면 동작하는 상태. 4가지 조건 모두 충족:
- raw `axios.get(url, { responseType: 'blob' })` (interceptor Bearer 헤더 미부착)
- 이미지/PDF 분기 통일 → `downloadAsBlob` 단일 경로
- `<a download>` 양쪽 onClick에 `e.preventDefault()` (cross-origin 무시 회피)
- `window.open` 폴백 제거 (catch는 `console.error`만)

## 이전 결론 정정 ⚠️

이전 메모리에 기록한 **"prod 머지 의미 없음 — 같은 S3 버킷"은 틀렸음**. 2026-05-02 콘솔 에러로 dev 버킷명이 `melonne-therapists-bucket-dev` (ap-northeast-2)임이 확인됨 → prod 버킷은 별도(`-dev` suffix 없는 별도 이름)일 가능성 매우 높음. 이미 prod 머지를 진행했고 prod에서도 동일 에러 발생을 확인했으니 dev/prod 모두 인프라 조치 필요.

## 확정된 사실

- **dev 버킷**: `melonne-therapists-bucket-dev` (ap-northeast-2)
- **prod 버킷명**: 미확인 (인프라 개발자에게 문의 필요)
- **staging Vercel origin (현재)**: `https://mellomefe-git-develop-ringo-waffles-projects.vercel.app` — preview URL이라 변동성 있음, 인프라에는 `https://*.vercel.app` 와일드카드 권장
- **prod origin**: `https://www.melonnetherapists.com`

## 인프라 개발자 재조치 요청 (메시지 초안 준비됨)

```json
{
  "CORSRules": [{
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://www.melonnetherapists.com",
      "https://*.vercel.app"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Disposition", "Content-Type", "Content-Length"],
    "MaxAgeSeconds": 3600
  }]
}
```

요청 포인트:
1. 현재 적용 상태 raw 출력 공유: `aws s3api get-bucket-cors --bucket <name>` (dev/prod 둘 다)
2. 위 룰을 dev/prod 두 버킷 모두 적용
3. prod 버킷명 회신 요청

## 적용 후 검증 방법

```bash
curl -I -H "Origin: https://www.melonnetherapists.com" \
     "https://<버킷명>.s3.ap-northeast-2.amazonaws.com/<객체키>"
```
응답에 `Access-Control-Allow-Origin: https://www.melonnetherapists.com` 있으면 OK.

## How to apply

인프라 개발자 회신 오면:
1. dev/prod CORS 적용 결과 raw 출력 검토
2. staging + prod 양쪽에서 다운로드 클릭 → 저장 다이얼로그 정상 표시 확인
3. DevTools에서 S3 요청에 `Authorization: Bearer ...` 미부착 확인 (있으면 인터셉터 회귀)

그 전에는 추가 프론트 변경 불필요. 다른 backlog 작업으로 전환 가능.
