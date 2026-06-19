---
name: feedback_offer_partial_scope_on_merge
description: "develop→main 머지/배포 제안 시 소스에 미완·보류 기능이 섞여 있으면 \"전량 적용\" 외 \"특정 기능 제외\" 선택지도 먼저 제시"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 410617a3-f5e0-4546-9830-5bfa8f34dce9
---

develop→main 머지나 외부 배포(airo/prod)를 제안할 때, 소스 브랜치에 **아직 운영에 올릴 준비가 안 된 기능(예: 랜딩 페이지)이 섞여 있으면**, "전량 적용" 외에 **"특정 기능 제외하고 적용" 선택지를 먼저 제시**할 것.

**Why:** 2026-06-07, develop→main 흐름을 물을 때 이분법(전량 머지 vs main 그대로 push)만 제시 → 사용자가 전량 승인 → 직후 "랜딩까지 운영 적용돼버렸다, 통제했어야 했는데"라며 롤백 요청. develop 내용을 표로 명확히 보여줬지만, 선택지 입도(granularity)가 전부-아니면-전무라 사용자가 기능별로 통제할 여지가 없었음.

**How to apply:** 머지 제안 전 소스 브랜치 구성을 보고, 미완/보류로 보이는 기능 묶음이 있으면 AskUserQuestion에 "X 제외하고 머지" 옵션을 넣거나, "develop에 ~가 섞여 있는데 운영에도 포함할까요, 빼고 갈까요?"로 한 번 더 확인. 제외 기법 박제 = [[project_landing_page_deprecation]] (랜딩 PR 첫 부모 머지).
