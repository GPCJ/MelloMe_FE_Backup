---
name: GA4 user_id 부착 정책 결정 — analyticsId 드롭, 이벤트 4종 즉시 착수
description: 2026-04-24 최종 결정. GA4 유저 단위 추적 안 함(Looker Studio/Firebase 로우데이터 대체). analyticsId 에픽 전체 드롭. 이벤트 4종은 백엔드 의존성 없이 즉시 삽입 가능.
type: project
updated: 2026-04-24
originSessionId: f611174e-26dc-4189-9e23-de39c771cab9
---
# GA4 user_id 부착 정책 결정 (최종)

**최종 결정 (2026-04-24):** GA4에서 유저 단위 추적을 하지 않기로 PM 결정. 유저 단위 분석은 Looker Studio 또는 Firebase Console 로우데이터로 대체. Clarity `identify()`도 미사용. `analyticsId` 백엔드 에픽 전체 드롭.

**1차 4종 삽입 완료 (2026-04-24, cf7750e).** 이벤트는 익명(GA4 client_id only) 발송 그대로 유지.
- 삽입 위치: SignupPage, LoginPage, TherapistVerificationPage, PostCreatePage
- `first_post_created`: `fetchMyPosts(0,1).totalElements === 0` 프론트 단독 판별

**2026-04-27 PM 정식 스펙 도착** → 24종(주요 7개) 정식 설계 공유. 상세 `./project_analytics_event_spec_pm_v1.md`. 익명 정책은 그대로 유지, 추가 삽입은 **프론트 독립 즉시 가능** (analyticsId 드롭으로 백엔드 의존성 0). 주요 7개부터 1차 착수.

**Why:** PM 결정. GA4 유저 단위 분석 UI 대신 Looker Studio/Firebase Console 로우데이터 방식 선택.

**How to apply:**
- `analyticsId` 관련 백엔드 요청 금지. 에픽은 드롭됨.
- "GA4 user_id 언제 붙여요?" 질문 오면 → 드롭 결정 안내.
- 추가 이벤트(주요 7개)도 익명 유지. `analyticsId`/Clarity `identify()` 추가 금지.

---

## [아카이브] 초기 검토 내용 (참고용)

초기에는 `analyticsId` 도입을 검토했으나 PM이 GA4 유저 추적 자체를 안 하기로 결정해 드롭됨.

검토했던 프론트 단독 해시 불가 근거:
- `user.id` 순차 정수 → rainbow table 역산 가능
- Salt 프론트 번들 삽입 시 DevTools 노출
- 평문 `user.id` 전송 시 PK enumeration + GA4 약관 위반
- email/nickname = PII 전송 금지
