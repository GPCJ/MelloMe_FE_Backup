---
name: GA4 user_id 부착 정책 결정 — pseudonymous analyticsId 대기
description: 2026-04-24 결정. GA4 user_id는 백엔드 HMAC 해시된 analyticsId만 사용, 프론트 단독 해시 금지. 4종 이벤트 삽입은 백엔드 배포 freeze 해제(04-28) 후 착수.
type: project
updated: 2026-04-24
originSessionId: f611174e-26dc-4189-9e23-de39c771cab9
---
# GA4 user_id 부착 정책 결정

**결정:** GA4/Clarity에 부착할 `user_id`는 반드시 백엔드가 HMAC-SHA256 + 서버 salt로 해시한 `analyticsId`를 사용합니다. 프론트 단독 해시·UUID·평문 `user.id` 전송은 모두 금지합니다. PM 확정 4종 이벤트(`signup_completed`, `login_completed`, `verification_requested`, `first_post_created`) 삽입 작업은 `analyticsId` 필드 배포 완료 전까지 전면 보류합니다.

**Why:**

1. **프론트 해시는 역산 가능** — `user.id`가 순차 정수라 프론트에서 `sha256(user.id)`만 돌리면 rainbow table로 1~N 전수 해싱 1~2분 내 역산됨. Salt를 프론트 번들에 넣으면 DevTools 노출로 salt 의미 상실.
2. **평문 `user.id` 전송 금지** — 내부 PK가 네트워크 탭에 노출되어 회원 수 enumeration 단서 제공. GA4 약관상 식별자는 "비식별·고유·안정" 3조건 필요, 순차 정수는 비식별 위반.
3. **email/nickname 절대 금지** — GA4 약관상 PII 전송 금지. 적발 시 속성/계정 데이터 삭제 리스크.
4. **로컬 UUID는 의미 없음** — 브라우저 단위 UUID는 client_id와 실질 동일, 크로스 디바이스 추적이라는 user_id 부착 목적 상실.
5. **데이터셋 일관성** — MVP 초기 트래픽 양이 적어 4~5일 임시 익명 수집 효용이 낮음. 시작점을 `user_id` 부착 버전으로 통일해야 퍼널/리텐션 분석이 깔끔함.

**How to apply:**

- "GA4 이벤트 언제 삽입할까요?" 류 질문이 오면 이 결정 인용: 백엔드 `analyticsId` 필드 배포 전까지 대기.
- 백엔드 freeze 해제(2026-04-28 예정) 후 `./jira_draft.md`의 에픽/스토리 5개 순서대로 착수. Story 1(백엔드 필드) → Story 2(프론트 user_id 부착) → Story 3(이벤트 4종 삽입) 의존 관계 준수.
- 프론트 임시 해시/평문 `user.id`/로컬 UUID로 우회 구현 절대 금지. 사용자가 "그냥 뭐라도 넣자" 해도 이 메모리를 근거로 만류.
- 중간에 익명(client_id only)으로 4종 이벤트만 먼저 삽입하자는 제안도 보류. 데이터셋 통일성 근거로 거절.
- 2026-04-28 이후 이 메모리 상태 재확인. `analyticsId` 배포 완료되면 이 결정문은 "완료" 섹션으로 이동 또는 삭제.
