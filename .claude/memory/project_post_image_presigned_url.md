---
name: 게시글 이미지 presigned URL 방식 — 백엔드 작업 대기
description: 게시글 이미지 미리보기 깨짐(401 추정) 대응으로 백엔드가 presigned URL 방식 채택. 프론트 대기 상태.
type: project
originSessionId: a737f971-f825-4c03-86e3-26906345f82a
---
## 배경 (2026-04-22)

게시글 이미지 미리보기가 실서버에서 깨지던 이슈 — 프론트 `<img>` 태그가 Authorization 헤더를 못 보내는데 백엔드 이미지 엔드포인트가 AT를 요구해 401로 추정. 백엔드에서 presigned URL 방식으로 가기로 결정.

**Why:** `<img>` 네이티브 동작을 해치지 않으면서 인증/만료 제어가 가능한 표준 패턴. 프로필 이미지(public) 방식과 다른 이유는 백엔드 측 설계 선호로 추정(확정 아님).

## 현재 프론트 상태

- `resolveImageUrl` 유틸이 `imageUrl` 상대경로 → 절대 URL 정규화 수행 중 (`PostDetailPage.tsx:320`)
- 절대 URL이 내려오면 유틸은 no-op으로 그대로 통과 — presigned URL 방식으로 바뀌어도 **코드 수정 거의 없이 동작할 가능성 높음**
- `new URL` 기반으로 안전화 완료(T3, 커밋 `a1b7532`)

## 백엔드 작업 완료 후 프론트에서 확인해야 할 항목

1. **URL 포맷**: 절대 URL로 내려오는가? (`https://...?X-Amz-Signature=...` 또는 자체 서명 쿼리 포함)
   - 절대면 `resolveImageUrl`은 pass-through — 그대로 둬도 됨
   - 상대면 `resolveImageUrl` 계속 필요
2. **만료 시간(TTL)**: 몇 분/몇 시간짜리 서명인지
   - 짧음(5–15분): 사용자가 페이지 오래 열어두면 403 가능 → `<img onError>`에서 게시글/이미지 재요청 훅 필요
   - 김(1시간+): 일반 사용 케이스에서는 대응 불필요
3. **만료 시 동작**: 403인지 다른 코드인지 (재시도 로직 분기에 필요)
4. **캐싱**: 같은 이미지에 대해 매 요청마다 URL이 바뀌는가?
   - 바뀌면 브라우저 캐시 적중률 낮음 → 리스트 UI 성능 체크
5. **스키마 필드명**: 기존 `imageUrl` 유지인지 `presignedUrl` 등으로 바뀌는지 (Swagger `/v3/api-docs` 재조회로 확인)
6. **프로필 이미지는 별도인가**: 현재 프로필 이미지는 public 방식(`project_image_public_absolute_path.md`). 게시글 이미지만 presigned로 가는 게 맞는지 확인 — 정책 일관성 체크

## 미리 구현하지 말 것

백엔드 스펙 확정 전에 "AT 붙여서 fetch + Blob URL 만드는 유틸" 같은 걸 미리 만들지 말 것. Presigned URL로 가면 그 유틸은 불필요 코드가 된다.

**How to apply:** 백엔드 작업 완료 알림 오면:
1. Swagger `/v3/api-docs` 재조회로 스키마/필드 확인
2. 실서버에서 시크릿 창 직접 접근으로 public 동작 확인
3. 위 6개 항목 체크 후 TTL 짧으면 `onError` 재요청 훅 추가 검토
4. `resolveImageUrl` 필요 여부 재검토 (pass-through면 유지, 불필요면 호출 제거)
