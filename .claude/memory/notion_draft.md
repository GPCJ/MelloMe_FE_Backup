---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /post-notion-draft로 업로드 가능.
type: draft
updated: 2026-05-07
originSessionId: 06162b14-0acf-492d-8617-d8c9d3294ddd
---

# #010 — 첨부 이미지 다운로드 CORS 에러: 브라우저 HTTP 캐시 오염

**날짜**: 2026-05-07 (4월 30일경 발견, 약 일주일간 잡음)
**분류**: CORS / 브라우저 캐시 / S3 presigned URL
**난이도**: ⭐⭐⭐⭐

## 문제 상황

게시글 상세 페이지에서 첨부 이미지 미리보기는 정상 표시되는데, 다운로드 버튼 클릭 시 CORS 에러로 실패. 이상한 점은 시간이 지나 presigned URL이 만료되고 새 URL이 발급되면 다운로드가 정상 작동한다는 것이었습니다.

```
Access to XMLHttpRequest at 'https://melonne-therapists-bucket-dev.s3.ap-northeast-2.amazonaws.com/...'
from origin 'https://mellomefe-git-develop-ringo-waffles-projects.vercel.app'
has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

dev preview와 prod 양쪽 모두 같은 증상. 발견 후 며칠 동안 "S3 CORS 미설정" 가설로 클라우드 개발자분과 협업했지만 해결 안 됨.

## 원인 분석

### 거쳐간 잘못된 가설

**가설 1 — S3 버킷 CORS AllowedOrigins 누락 (틀림)**

에러 메시지가 "No Access-Control-Allow-Origin header"라 자연스럽게 S3 설정 문제로 보였습니다. 클라우드 개발자분이 dev 버킷 CORS를 설정했지만 증상 그대로.

**가설 2 — presigned URL별로 CORS 정책이 다르게 적용됨 (불가능)**

"옛 URL은 막히고 새 URL은 통과"라는 관찰을 설명하기 위한 가설. 하지만 S3 CORS는 버킷 단위 정책이라 URL별로 다르게 적용될 수 없습니다.

### 실제 원인 — 브라우저 HTTP 캐시 오염

```
1. <img src={presignedUrl}> 렌더 (crossOrigin 속성 없음)
  → 브라우저가 no-cors 모드로 요청 (Origin 헤더 없음)
  → S3는 ACAO(Access-Control-Allow-Origin) 헤더 안 붙여서 응답
  → 디스크 캐시에 저장 (key = URL 전체)

2. 사용자가 다운로드 버튼 클릭
  → axios.get(url, { responseType: 'blob' }) — CORS 모드 요청
  → 브라우저: 같은 URL 캐시 있음 → 응답 재사용
  → 캐시된 응답에 ACAO 없음 → CORS 검증 실패 → 차단
  → 콘솔: "No Access-Control-Allow-Origin header"
  ※ 이 시점에 S3는 두 번째 요청을 본 적도 없음. 브라우저가 캐시로만 판정.

3. presigned URL 만료 → 새 URL 발급 (다른 Signature)
  → 캐시 키 미스 → fresh 요청
  → 다운로드 코드의 CORS 모드로 요청 → S3가 ACAO 동봉 응답
  → 검증 통과 → 다운로드 성공
```

"새 URL은 동작" 현상의 진짜 메커니즘은 **URL 변경으로 캐시 키가 미스되어 새 요청이 나간 것**이지, S3가 새 URL에만 CORS를 적용한 게 아니었습니다.

### 진단 결정타

콘솔에서 같은 URL을 fresh fetch:

```js
fetch(url, { cache: "no-store" }).then((r) => r.ok);
// → true
```

`cache: 'no-store'`는 캐시를 우회하므로, 이 값이 true면 **S3 CORS는 정상**이라는 뜻. 그럼에도 다운로드가 막힌다면 범인은 캐시밖에 없습니다. 이 비대칭이 가설을 캐시로 좁힌 결정적 증거였습니다.

## 해결

### 코드 fix

`PostDetailPage.tsx`의 `<img>` 태그 두 곳에 `crossOrigin="anonymous"` 추가:

```diff
  {images.map((img) => (
    <div key={`img-${img.id}`}>
      <img
+       crossOrigin="anonymous"
        src={resolveImageUrl(img.imageUrl) ?? ''}
        ...
      />

  {post.attachments?.map((att) => (
    {isImage && (
      <img
+       crossOrigin="anonymous"
        src={att.downloadUrl}
        ...
      />
```

이 한 속성으로 실제 원인 1번이 통째로 바뀝니다. 브라우저가 처음부터 CORS 모드로 요청 → S3가 ACAO 동봉 응답 → 캐시에 ACAO 포함된 응답 저장 → 다운로드 시 캐시 재사용해도 검증 통과.

`anonymous` = "쿠키/credentials 없이". presigned URL은 쿼리 서명으로 인증하므로 쿠키 불필요.

## 핵심 개념

### 리소스 요청 모드

같은 URL이라도 누가 요청하느냐에 따라 모드가 다릅니다.

| 요청자                                         | 기본 모드             | Origin 헤더 |
| ---------------------------------------------- | --------------------- | ----------- |
| `<img>`, `<script>`, `<link rel="stylesheet">` | no-cors               | 안 보냄     |
| `fetch`, `XMLHttpRequest`                      | cors                  | 보냄        |
| `<img crossOrigin="anonymous">`                | cors (no credentials) | 보냄        |

서버는 Origin 헤더가 있을 때만 CORS 응답 헤더를 붙입니다. 따라서 같은 리소스의 응답 내용이 요청 모드에 따라 달라집니다.

### HTTP 캐시 키와 응답 내용의 비대칭

캐시는 URL을 키로 응답을 저장합니다. 하지만 응답 내용은 요청 모드에 따라 달라집니다. 이 비대칭이 cache poisoning의 본질입니다.

먼저 no-cors로 가져와 ACAO 없이 캐시된 응답을, 나중에 CORS 모드 요청이 재사용하면 차단됩니다.

### presigned URL과 캐시

presigned URL은 쿼리 스트링에 서명을 담습니다. URL이 바뀌면 캐시 키가 바뀌므로, 만료 후 새 URL은 자연히 캐시 미스 → fresh 요청을 트리거합니다. 이게 "새 URL은 된다" 현상의 메커니즘.

## 면접 포인트

**Q. CORS 에러 메시지를 받고 어떻게 진단을 좁혔는가?**
A. 에러 메시지의 표면("ACAO 헤더 없음")만 보면 서버 설정을 의심하게 됩니다. 진짜 진단은 "이 응답이 어디서 왔는가"를 묻는 것에서 시작됐습니다. `fetch(url, { cache: 'no-store' })`로 캐시를 우회한 응답이 정상이면 서버 CORS는 정상이라는 뜻이고, 그럼에도 다른 요청이 막힌다면 범인은 캐시뿐입니다. 메시지의 발신자(서버 vs 브라우저 자체 검증)를 분리하는 게 핵심 단계였습니다.

**Q. 왜 같은 URL인데 어떤 요청은 통과하고 어떤 요청은 막혔는가?**
A. 같은 URL이라도 요청 모드가 다르면 응답이 달라질 수 있습니다. `<img>`는 기본 no-cors라 Origin 없이 요청하고, 서버는 ACAO 헤더 없이 응답합니다. 그 응답이 캐시에 박힌 후 CORS 모드 요청(fetch/axios)이 같은 URL을 재사용하면 ACAO 검증을 통과하지 못합니다. 캐시는 URL을 키로 저장하지만 응답 내용은 모드별로 다른, 이 비대칭이 원인입니다.

**Q. 비슷한 함정이 또 있는가?**
A. cross-origin 이미지를 Canvas에 그리려 할 때 발생하는 "tainted canvas" 문제, Web Audio API로 cross-origin 오디오를 분석하려 할 때, fetch로 cross-origin 이미지를 blob으로 받아 처리할 때 모두 같은 구조입니다. 공통 처방은 "JS로도 응답을 읽을 거면 처음부터 `crossOrigin` 속성을 붙여라".

## 한계점 / 후속 작업

- **S3 CORS가 정상 설정된 전제**가 필요합니다. AllowedOrigins에 origin이 없으면 `crossOrigin="anonymous"` 추가만으로는 이미지 자체가 표시 안 됩니다. 우리 환경은 정상 등록 확인 완료.
- 브라우저 캐시 partition 정책은 spec보다 엔진 구현에 의존하는 부분이 있어, 다른 브라우저(특히 Safari/iOS)에서 동일 메커니즘인지 별도 검증 필요.
- 9720c9e는 develop에만 반영. main(prod) 머지는 별도 세션에서 회귀 범위 점검 후 진행 예정.

---
