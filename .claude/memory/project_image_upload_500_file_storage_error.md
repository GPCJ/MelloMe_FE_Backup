---
name: 이미지 업로드 500 - FILE_STORAGE_ERROR
description: POST /posts/{id}/images 500 응답 패턴 — 백엔드 파일 저장 인프라 추정 + #2/#3과 단일 root cause 가능성
type: project
created: 2026-04-29
originSessionId: 471e1311-e0e3-4555-81b6-38f3f73186b6
---
## 발견 (2026-04-29)

```
POST https://api.melonnetherapists.com/api/v1/posts/28/images → 500
{
  "code": "FILE_STORAGE_ERROR",
  "message": "파일 저장/삭제 중 오류가 발생했습니다.",
  "status": 500,
  "fieldErrors": null
}
```

## 진단

- 출처: 백엔드 구조화 에러 응답 (예외 핸들러 catch 후 코드 부여). 프론트 multipart payload 자체는 정상 도달.
- 의미: 백엔드가 파일 수신은 했고, S3/로컬 저장 단계에서 실패.
- 원인 후보 (모두 백엔드 인프라):
  - S3 credentials 만료/누락
  - 버킷 권한 회귀
  - 백엔드 환경변수 누락 (특히 prod-only)
  - 디스크 공간/권한 (로컬 저장 케이스)
- 프론트 책임 범위 0 — 코드/payload 변경으로 해결 불가.

## 단일 root cause 가능성

노트패드 #2(`POST /therapist-verifications`), #3(`POST /me/profile-image`)도 multipart 500. 셋 다 응답 `code`가 `FILE_STORAGE_ERROR`로 동일하면 백엔드 단일 인프라 회귀 1건으로 묶임.

**확인 미진행**: #2/#3의 Response body `code` 필드. 다음 세션에서 staging 환경 검증과 동시에 확인.

## 액션

- ~~1차: staging에서 동일 요청 재현 → 500 재현 여부 확인~~ **(완료, 2026-04-29)**
  - **결과: staging도 동일 500 → 백엔드 코드 회귀로 확정**
  - prod 환경변수 누락 가설은 폐기 (단, APP_BASE_URL 누락과는 별건일 수 있음)
- 2차: airo 이슈 등록 (단일 vs 분리는 #2/#3 `code` 확인 후 결정) — **다음 액션**
- 3차: 백엔드 freeze 풀린 첫날(2026-04-29~) 협의

**Why:** staging 재현 = 환경 의존이 아니라 코드 경로 자체 깨짐. 백엔드 git log/diff 추적이 가장 빠른 fix 경로
**How to apply:** airo 이슈에 staging 재현 사실 명시, 백엔드한테 최근 multipart/저장 로직 변경 커밋 우선 검토 요청
