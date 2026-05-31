---
name: feedback_clarify_logging_intent_console_vs_remote
description: "백엔드/PM \"로깅 추가\" 요청 받으면 착수 전 console-only vs 원격 수집(Sentry) 의도부터 한 줄로 확인"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e46840d8-0d58-410a-acd9-c91ce82d1c42
---

백엔드/PM이 "FE에서 실패 응답 다 로깅 좀 해주세요" 류 요청을 하면, **착수 전에 의도부터 가른다**. 두 가지 작업 규모가 완전히 다름.

## 가르는 축
- **console-only (편의용)**: FE `console.error`로 브라우저 콘솔에만 찍음. **백엔드 인프라/로그에 0 영향** — 사용자분 본인 디버깅, 서버 로그와 cross-reference 자료, 사용자 신고 시 캡처 자료용. 작업 단위 작음(catch 블록·인터셉터 몇 곳).
- **원격 수집 (Sentry 등)**: 외부 서비스로 FE 에러를 자동 수집해 백엔드/PM이 대시보드에서 봄. **인프라 추가·비용·도입 결정·환경변수 추가** 필요. 작업 단위 큼.

요청 문구만 보면 둘이 안 가려짐. 한 줄 확인이 결정적.

## 확인 문구 (그대로 활용 가능)
> 말씀하신 로깅이 콘솔 로깅으로 충분한지(저희 디버깅·캡처 편의용), 아니면 Sentry 같은 원격 수집 서비스로 모이는 게 필요하신지 확인 부탁드려요. 후자면 별도 도입 검토가 필요해서요.

## 2026-05-28 사례
백엔드(남다경) "이미지 첨부 4xx~5xx 다 로깅 해주면 좋겠다" 요청 받고 console-only로 진행([[project_image_attach_log_prefix_convention]], `fd39c11`). 사용자가 "백엔드에 영향 가는 게 있냐"고 물어보면서 의도 확인 필요성 자각. 현 시점엔 백엔드 의도 미확인 상태로 가장 가벼운 console-only 채택, 추후 원격 수집 요청이면 별도 결정.

**Why:** 작업 규모 오해로 과작업·과소작업 둘 다 방지. 한 마디 확인이 며칠 작업 가름.
**How to apply:** 백엔드/PM "로깅 추가" 메시지 받으면 무조건 위 한 줄 먼저 보낸 뒤 답 듣고 착수. 답 안 받고 바로 console-only 가는 것도 OK이나, **요청자 의도와 일치 여부를 작업 후라도 한 번 명시적으로 확인** 권장. [[feedback_explain_before_act]] [[feedback_ask_when_uncertain]]
