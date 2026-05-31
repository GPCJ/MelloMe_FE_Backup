---
name: ""
description: "기계적/미러링 코드는 AI 작성+본인 리뷰, 새 로직/아키텍처/결정은 본인 작성. 항상 커밋 전 \"왜\"를 재구성. AI의 product 코드 작성은 deadline-guard 훅 unlock 필요(위임 시 본인이 touch)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 441d03d6-0d7f-438e-9654-eaf4b835590a
---

2026-05-26 갱신: "전부 직접 작성"에서 **하이브리드(작업 유형별 분담)** 로 의식적 전환. 본인이 쪽지 기능 슬라이스 1 구현 중 "상세 수도코드를 받아쓰는 건 생산성도 낮고 역량도 안 는다"고 판단. AI 페어코딩 시대 현실 반영.

**분담 기준:**
- **AI 작성 → 본인 리뷰:** 기계적·보일러플레이트·기존 코드 미러링 (예: `types/message.ts`, `api/messages.ts`). 손으로 쳐도 배울 게 없고 전사 노이즈(오타·문법)만 생기는 것.
- **본인 작성:** 새 로직·아키텍처 결정·이해가 중요한 부분 (예: SSE 연동, 읽음 처리, RQ vs store 선택, 드롭다운 self 판정). 역량이 자라는 곳.
- **항상(모드 무관):** 커밋 전 "왜 이렇게 되는지" 본인 말로 재구성. 가치의 원천은 타이핑이 아니라 사고(2026-05-26 슬라이스 1에서 가치를 만든 건 referenceId 가정·RQ/store 판단이었지 타이핑이 아니었음).

**Why:** [[user_self_coding_goal]]가 "전부 손수"에서 "사고 집약 부분은 손수 + 기계적인 건 위임 + 항상 이해"로 진화. 받아쓰기 낭비를 없애고 사고는 보존. 단 AI 100% 작성은 리뷰가 "그럴듯함 체크"로 얕아져 AI가 박아넣은 틀린 가정/슬롭을 못 거르는 위험이 있어 배제 ([[user_ai_dependency_anxiety]] 맥락).

**훅 처리 (2026-05-26 결정 — 훅 유지 + 위임 시 unlock):**
- `.claude/hooks/deadline-guard.sh`는 그대로 둠 (AI의 product 코드 Edit/Write 차단 마찰 장치 유지).
- AI에게 기계적 조각을 위임할 때만 본인이 `! touch .claude/deadline-unlock` 실행 (mtime 기준 4h TTL).
- unlock 의미가 "데드라인 임박" → **"이번 기계적 조각을 의식적으로 AI에 위임"** 으로 재해석됨.
- 이 마찰을 남긴 이유: 본인이 우려한 "AI 100%로 미끄러짐"을 막기 위함.
- AI는 unlock 흔적이나 본인의 명시 위임이 없으면 product 코드 Edit/Write 시도 금지 — 방향/제약/리뷰만 제공. Hook이 exit 2로 차단하면 정상 동작이므로 우회/재시도 금지, unlock 안내만.

**예외 — 인프라/툴링 코드 (기존 유지):** `scripts/`, `.claude/hooks/`, CI 설정 등은 본인 명시 허락 시 unlock 없이 AI 작성 가능. 학습 우선순위가 `frontend/src/` product 코드라.

**.md / `.claude/` 편집 (기존 유지):** 메모리·문서·스펙은 hook도 통과시키고 본 규칙 적용 안 함 (자유).

관련: [[feedback_pseudocode_first_protocol]] — 본인 작성 파트엔 수도코드 우선 여전히 유효하나, "상세 수도코드 받아쓰기"는 지양하고 방향·제약 위주로 경량화.
