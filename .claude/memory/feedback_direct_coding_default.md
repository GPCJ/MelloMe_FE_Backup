---
name: 직접 작성 모드 — AI 코드 생성은 데드라인 임박 시에만
description: 사용자가 모든 코드를 직접 작성하기로 했고, 데드라인 임박 시에만 AI 코드 생성을 unlock — Edit/Write/MultiEdit/NotebookEdit 사용 전 unlock 확인
type: feedback
originSessionId: 51024985-fff5-4976-8d18-db831a6acdf1
---
코드 작성 요청을 받아도 기본 응답은 **힌트/수도코드/리뷰/설명**이며, `Edit`/`Write`/`MultiEdit`/`NotebookEdit` 호출은 시도하지 않습니다. 사용자가 직접 코드를 작성합니다.

**Why:**
- 사용자가 AI 의존을 줄이고 직접 코딩 역량을 키우는 중 (`user_self_coding_goal.md`, `user_ai_dependency_anxiety.md`).
- 관성으로 "그냥 짜줘"가 나올 위험을 본인이 자각하고 명시적 안전장치를 요청 (2026-04-29).
- 1차 차단은 PreToolUse hook(`.claude/hooks/deadline-guard.sh`)이 하지만, AI도 같은 방향으로 행동해야 hook 우회 시도/소모가 생기지 않습니다.

**How to apply:**
- 코드 파일(.ts/.tsx/.js/.css/.java/설정파일 등) 변경 요청 → 기본은 거부 + 힌트 제공 + "데드라인 임박이면 unlock 후 다시 요청해주세요" 안내.
- 메모리/문서(`.md`, `.claude/` 하위) 편집은 자유 (hook도 통과시킴, 본 규칙 적용 안 함).
- Hook이 차단(exit 2)으로 응답하면, 그것이 정상 동작이므로 우회/재시도 금지. 사용자에게 unlock 절차 안내만.
- 사용자가 명시적으로 unlock을 했고(`! touch .claude/deadline-unlock` 실행 흔적이 있거나 본인이 직접 언급), 데드라인/사유가 분명할 때만 코드 작성에 응합니다. unlock이 단순 마찰 회피용으로 풀려있는 것 같으면 사유 한 번 확인.
- "막혀서 빠르게 진행 안 됨" 같은 호소는 unlock 사유로 부족합니다 — 학습 의도와 충돌. 본인이 직접 unlock하면 따르되, 코드 생성 전 "데드라인이 어떤 일정에 걸려 있나요?" 한 줄 확인 정도는 유지.

**Unlock 메커니즘:**
- 사용자가 `! touch .claude/deadline-unlock` 입력 → `mtime` 기준 4시간 동안 hook이 통과시킴
- 4시간 만료 후 자동 재차단. 만료 후 다시 풀려면 같은 명령 재실행 필요
- 강제 해제(hook 비활성화)는 settings.local.json 직접 편집해야 함 — 충동적으로 못 풀게 의도된 마찰

## 예외 — 인프라/툴링 코드 (2026-04-29 정의)

`scripts/`, `.claude/hooks/`, CI 설정, 개발 환경 자동화 등 **인프라/툴링 코드**는 사용자 명시 허락 시 deadline-unlock 없이도 AI 작성 가능합니다.

**Why:** 학습 우선순위가 프론트 product 코드(`frontend/src/`)에 집중되어 있고, 인프라 자동화는 학습 범위 밖이라 위임이 합리적입니다. 2026-04-29 사용자가 "이번만 너가 코드 수정해줘 프론트 개발 코드는 내가 할테니까"라고 명시하며 범위를 가르릅니다.

**How to apply:**
- 스크립트/hook/CI 작업 요청 시 사용자의 명시 허락 한 줄(예: "이번만", "스크립트는 너가") 받고 진행 OK.
- 명시 허락 없이 자동 진행은 금지 (frontend product 코드와 동일 처리).
- 작성 후 사용자가 다음 push 전 한 번 read해 이해 — 인프라도 학습 0은 아님.
- 경계 모호한 케이스(빌드 스크립트인지 frontend 빌드 도구인지 등)는 사용자에게 확인.

이 예외는 `.claude/` 와 `.md` 통과 규칙(hook 차원)과는 별개의 의미적 룰입니다 — hook은 통과시키지만 정책상 본인 작성이 default인 영역(예: hook 자체 코드)도 있을 수 있음.
