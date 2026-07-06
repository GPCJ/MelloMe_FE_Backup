---
name: feedback_fe_ahead_of_backend_strategy
description: "백엔드 명세 미확정 신규 기능 — 뷰모델 타입+로컬 목으로 UI 선행, 추측 계약 MSW 구현은 회피하고 명세 후 와이어/통신부 진행"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1660f044-7119-4166-bb15-e57715bc7a57
---

백엔드 응답/요청 명세가 아직 확정되지 않은 신규 기능을 시작할 때, 사용자가 확정한 작업 전략:

- **뷰모델 타입을 먼저 정의해 UI를 선행 구현**한다. 뷰모델 = UI 컴포넌트가 소비하는 형태(우리 소유, 설계로 이미 확정됨)이고, 와이어 타입 = 서버가 주고받는 형태(백엔드 의존)다. 이 둘을 분리하면 "새 기능은 타입부터"의 첫 타입이 와이어가 아니라 뷰모델이 되어, 백엔드 무관하게 시작할 수 있다.
- **UI 검증은 로컬 목 객체를 props로 직접 주입**해서 한다(네트워크 0). 추측한 서버 계약을 어디에도 박지 않는다.
- **추측 계약으로 MSW E2E를 만드는 안은 회피**한다. 추측 계약은 MSW 핸들러·와이어 타입·읽기 분기 등 여러 곳에 박혀 "나중에 통신만 수정"이 성립하지 않고, 갈아엎을 가정만 늘린다. (예외: PM 데모 등 dev에서 전체 플로우를 클릭으로 돌려야 하는 명확한 목적이 있으면 MSW가 값을 한다.)
- 와이어 타입·`api/*.ts` 통신 매핑·읽기 분기는 **백엔드 명세 확정 후** 손댄다. API 매핑을 어댑터 한 곳(`api/<feature>.ts`)에 격리하면, 명세 확정 시 어댑터만 수정하고 UI·호출부는 안 건드린다.

**Why:** 명세 확정 전 추측 구현은 재작업 비용. 뷰모델/와이어 분리 + 어댑터 격리로 백엔드 의존부를 한 곳에 모으면 UI를 미리 완성해두고도 통신부 수정 범위가 최소화된다.

**How to apply:** 백엔드 대기 중인 기능(예: [[project_concern_card_feature]], [[project_messaging_feature]])을 진행할 때, "지금 손댈 것(뷰모델·UI·신규 파일·컨테이너 배선) / 명세 후 손댈 것(와이어 타입·통신·읽기 분기)"으로 페이즈를 갈라 제안한다. MSW 부활이나 추측 계약 구현을 기본값으로 제안하지 않는다. 관련 [[feedback_verify_spec_before_workaround]], [[feedback_msw_simulates_backend_policy]].

## ⚠️ MSW 더미 기반 선행 기능 = prod 머지 전 BE 엔드포인트 prod 배포 확인 필수 (2026-06-30)

MSW 더미로 만든 선행 기능을 **prod에 올리기 전, 해당 BE 엔드포인트가 prod에 실제 배포됐는지 반드시 확인**한다. prod는 MSW OFF(`VITE_MSW_ENABLED` 미설정)라 실제 BE를 호출하므로, 엔드포인트 미배포면 빈 화면이 아니라 **404 → 에러 화면(재시도 버튼)**이 운영 사이트에 노출된다 (빈 목록 200이어야 empty state로 자연스러움).

- **사례**: 구인공고 Phase1(MSW 더미, [[project_job_posting_feature]])을 prod 머지(`837fb54`)했다가 `/job-posts` 404로 즉시 revert 제거(`1896774`, 2026-06-30). staging(develop)은 MSW ON이라 정상이었으나 prod에서만 깨짐.
- **엔드포인트 존재 확인 팁**: prod BE가 Spring Security면 미배포 경로도 인증 필터에서 401 → **401만으론 엔드포인트 존재 단정 불가**. 인증 통과 후 404로 확인하거나 prod Swagger/팀 확인.
- **prod 정리 시**: 이미 push된 prod 머지를 되돌릴 때 force-push보다 **revert-on-top(fast-forward)**을 우선한다(prod 히스토리 안전, 백업 브랜치는 별도 보존). 관련 [[feedback_force_push_safety_protocol]], [[feedback_offer_partial_scope_on_merge]].
