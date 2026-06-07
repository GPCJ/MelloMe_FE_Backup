---
name: feedback_verify_analytics_env_gate_first
description: GA4/Clarity/Sentry 등 분석 도구의 환경별 발사 여부 단언 전 index.html/init 코드의 hostname·env 가드 grep 우선
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 94754fcd-1b35-49f6-b186-e83a95e63830
---

분석 도구(GA4·Clarity·Sentry·Hotjar 등)가 "X 환경에서 집계되나/안 되나"라는 질문 도착 시, 추측·기본 가정으로 답하지 말고 **먼저 `index.html` 또는 init 코드에서 `location.hostname` / `import.meta.env` 가드를 grep**으로 확인한 뒤 답한다.

**Why:** 2026-05-29 대화에서 "develop 도메인에서 GA4 집계되나?"에 처음에 "환경 분기 없음, 집계됨"이라 답했다. 사용자가 "막아둔 것 같다"고 짚어줘서 다시 보니 `frontend/index.html:26,33`에 `location.hostname === 'www.melonnetherapists.com'` 가드가 박혀 있어 develop/staging/localhost는 **차단** 상태였음(`b8afcff fix(analytics): GA4·Clarity를 prod 도메인에서만 활성화` 커밋). 처음 grep을 `gtag` 호출 위치로만 하고 `hostname`/`env`/조건문은 안 봐서 놓침. 사용자가 자기 코드 작성자라 기억이 가장 정확했음.

**How to apply:**
- 환경별 분석 도구 동작 질문 도착 → 즉답 X
- **1단계 grep**: `index.html`에서 `hostname`/`location.host`/`import.meta.env`/`process.env` + `gtag('config'/`/`clarity(/Sentry init 같은 초기화 라인 함께 확인 (스크립트 로드 자체와 config 호출이 다른 라인일 수 있음 — 가드는 보통 config 쪽)
- **2단계 grep**: `src/main.tsx`, init 헬퍼, `lib/analytics.ts` 등에서 동일 패턴
- 가드 발견 시 → 가드 조건 정확히 인용해서 답
- 가드 없음 확인 시에만 → "환경 분기 없음, 모든 환경 발사" 답
- 사용자가 "막아뒀을 것 같다/예전에 처리했다"라고 말하면 **자기 코드 기억이 우선** — 추측으로 반박 말고 grep으로 검증 후 답
- 관련 정책: [[feedback_verify_rules_root_cause]], [[feedback_verify_spec_before_workaround]]
