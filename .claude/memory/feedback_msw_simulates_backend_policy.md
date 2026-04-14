---
name: MSW 핸들러는 백엔드 권한/정책을 시뮬레이션해야 함
description: MSW mock이 백엔드 정책을 그대로 재현해야 프론트 회귀 버그를 mock 단계에서 잡을 수 있음 — USER visibility=PRIVATE 차단 사례
type: feedback
originSessionId: 1c5f9820-1e8b-4d01-bbca-a067d9627bb2
---
MSW 핸들러는 요청 body를 무조건 수용하지 말고, **백엔드가 거부할 요청은 mock도 같은 status로 거부**해야 한다.

**Why:** 개발 중 프론트는 주로 mock으로 동작 검증한다. Mock이 정책을 통과시키면 프론트의 권한 우회 버그(잠금 로직 삭제, 상태 오염 등)가 mock 단계에서 드러나지 않고 실제 백엔드 연결 후에야 발견된다. 2026-04-14 코드 리뷰에서 MSW POST/PATCH `/posts`가 USER 롤의 `visibility=PRIVATE` 요청을 role 체크 없이 수용하던 점이 지적됐고, 403 반환하도록 수정했다(커밋 `770e7af`).

**How to apply:**
- 새 MSW 핸들러 작성 시 체크리스트:
  1. 이 엔드포인트가 실제 백엔드에서 role/권한/상태 기반 거부를 수행하나?
  2. 거부한다면 mock도 동일한 상태 코드(403/400 등) + 구조화된 에러 body 반환
  3. `testAccounts[currentUserEmail]`에서 role을 읽어 분기 — 이미 다른 핸들러에서 `isPrivileged` 패턴 사용 중
- 백엔드 Swagger/정책 문서가 "WHO can do WHAT"을 명시하면 그대로 옮기기
- 정책을 모르면 **통과시키지 말고** 주석으로 "백엔드 확인 대기"를 남기고 TODO 처리
- MSW 핸들러는 단순 fixture가 아니라 **프론트 단위 회귀 테스트 환경**의 일부로 취급

**관련:** `mocks/handlers/posts.handlers.ts` POST/PATCH에 `isPrivileged` 체크가 예시로 있음. 다른 write 엔드포인트 추가 시 같은 패턴 복제.
