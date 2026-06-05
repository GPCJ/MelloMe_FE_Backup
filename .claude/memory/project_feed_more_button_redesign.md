---
name: project_feed_more_button_redesign
description: "홈피드 \"더보기\" 재설계 결정 — 인라인 펼침 폐기 → 단일 신호화 + 생략 신호 소유권 프론트 단독화 (2026-06-04)"
metadata: 
  node_type: memory
  type: project
  originSessionId: fa3a5f3f-83d8-44d7-b7bb-db396d38c087
---

홈피드 `PostCard` 본문 미리보기의 "더보기"를 재설계한 결정 (2026-06-04, develop 반영 완료).

**결정 요지**
- 인라인 펼침(제자리 펼침 토글) **폐기**. 본문은 5줄 클램프만 하고, 잘리면 "... 더보기"를 **버튼이 아닌 신호 텍스트**로 표시. 클릭은 카드 전체 `<Link to=/posts/:id>`가 상세로 흡수(별도 onClick 없음).
- `line-clamp`의 자동 "…"가 6줄째 "... 더보기"와 중복 → **높이 기반 클램프(`max-h-[100px]` = leading-5 20px×5 + `overflow-hidden`)로 전환**해 자동 말줄임 회피.
- 백엔드 글자수 생략 "..."와 프론트 신호 중복 → 어댑터 `utils/contentPreview.ts`(`parseContentPreview`)가 끝의 "..."/"…"를 떼어내 `backendTruncated` 불리언으로 승격, 본문은 표식 없는 text 렌더. 노출 조건 `showMore = backendTruncated ∥ overflowed(5줄)` → **생략 신호 소유권을 프론트 단독화**.

**판단 기준 (이 결정을 끌고 간 3축)**
1. 동선 중복 제거 — 카드가 이미 상세로 가는 Link라 인라인 펼침은 경쟁 동선.
2. 신호 소유권 단일화 — "더 있음"을 백엔드(글자수)·프론트(줄 수)가 둘 다 알리면 중복·불일치.
3. 시각 무게 = 신호 — 버튼처럼 보이면 정조준 착시(한손 조작 불편)+투머치. 신호임이 드러나게 무게↓.

**완결 상태**: dev 시각 검증 후 develop 푸시 — `fb42a22`(백엔드 "..." 흡수) + `bc590da`(인라인 펼침 제거+5줄 클램프). 프론트 단독 완결.

**한계 (박제)**
- "..." 문자열 휴리스틱이라 작성자가 본문을 "..."로 끝낸 짧은 글은 잘림 오탐 → "더보기" 오노출(클릭 시 동일 상세라 무해하나 부정확).
- 고민카드 `ConcernCard`(본문 별도 clamp 메커니즘)는 이번 조치 범위 밖.

**정식 해결 = 백엔드 플래그**: `contentPreview` 응답에 `contentTruncated`/`hasMore` 불리언 추가받으면 휴리스틱 → 플래그 교체로 오탐 제거. `contentPreview` 생략 규칙(글자수 한도)이 openapi 미문서화 → 스펙 명문화도 함께 요청. 진행 상황은 backlog `F-08 [BE]`.

⚠️ 주의: 플래그 없이 백엔드 "..."만 제거 요청 금지 — 5줄 이내로 잘린 글에서 프론트가 잘림 여부를 못 알아 "더보기" 누락(정보 손실). "..." 제거는 반드시 플래그 동반.

연관: [[feedback_fe_ahead_of_backend_strategy]] (어댑터 격리로 FE 선행), [[feedback_memory_vs_backlog_split]] (진행=backlog/결정=memory).
