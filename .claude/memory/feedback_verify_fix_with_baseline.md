---
name: fix 검증 시 baseline 측정 우선
description: 패치 적용 전 재현 절차로 before-state를 먼저 확보한 뒤에야 after-state의 OK가 의미를 가짐, 비교 없는 after-only 검증 금지
type: feedback
originSessionId: 67b5e1ef-28b2-4f79-adf5-12683b0cb775
---
fix 검증 시 **before-state(가드/패치 없는 코드)의 재현을 먼저 확보**한 뒤에 after-state를 측정해야 합니다. 비교 없이 after만 측정하면 원래도 OK였는지 fix 덕분에 OK인지 구분할 수 없습니다.

**Why**: 2026-05-11 댓글 중복 POST fix 검증 중 사용자가 직접 지적했습니다 — "조치 이전에 정말 2번 요청 가는지 확인 안 해봐서 진짜 고쳐진지 모르겠다". A+B 가드 적용 후 한글 Enter 시 POST 1건만 발생했지만, develop 브랜치로 돌려도 1건이라 fix 효과 자체를 입증할 수 없었습니다. baseline 없는 after-only 측정으로 사용자 컨펌 단계에서 막혔고, A/B 비교를 위해 브랜치 토글을 한 번 더 해야 했습니다.

**How to apply**:
- 버그 fix 시작 시 **재현 절차부터 확보**합니다. "어떤 동작을 하면 버그가 보이는가"를 먼저 캡처하고, 그 동작이 patch 후 사라지는지 비교합니다.
- 사용자에게 검증 안내할 때 **"fix 안 했을 때 실패 재현됐는지"** 한 줄을 먼저 체크하도록 유도합니다. 예: 콘솔 카운터/네트워크 spy 설치 → fix 전 브랜치에서 재현 시도 → fix 브랜치로 전환 후 사라지는지 확인.
- 사용자 환경에서 재현 불가한 버그는 "방어 코드 적용 + prod 로그 모니터링" 흐름임을 처음부터 명시해, after-only 검증의 한계를 사용자가 인지하도록 합니다.

**사례 추가 (2026-05-11, 같은 날 박제된 규칙을 같은 날 위반)**: PostDetailPage 첨부 이미지 미리보기 안 나오는 문제에서 `<img crossOrigin="anonymous">` silent fail을 가설로 잡고 `$0.naturalWidth` 검증 없이 한 줄 패치(crossOrigin 제거)를 박았습니다. 실제 검증해 보니 `naturalWidth: 1` — silent fail이 아니라 백엔드 단의 1x1 손상 이미지였고, crossOrigin은 원인이 아니었습니다. baseline(`$0.naturalWidth === 0` 확인)을 먼저 했다면 가설이 즉시 깨졌을 흐름. 사용자가 "왜 한 거야?"로 추궁해 박제된 규칙 위반을 자각했습니다. 추측 기반 fix의 전형적 함정.
