---
name: AI 직접 작성 코드 → 인지부채 HIGH 태그로 메커니즘 상세 기록
description: Claude가 사용자 대신 작성한 코드는 별도 implementation 메모리에 cognitive_debt HIGH 태그 + 메커니즘 상세 기록. 사용자가 멘탈 모델을 못 만든 코드를 다음에 만질 때 복원하기 위함.
type: feedback
created: 2026-04-15
originSessionId: 3599b53a-b50a-42ce-a92e-91432d0449b0
---
# AI 직접 작성 코드 = 인지부채 HIGH 기록 의무

## 규칙
Claude가 사용자 대신 직접 작성/편집한 코드는, 커밋 직후 별도 메모리 파일에 **상세 메커니즘**을 기록한다. frontmatter에 `cognitive_debt: HIGH` 태그.

## Why
- `user_self_coding_goal.md` 정책: AI 의존 줄이기, 코드 작성은 원칙적으로 사용자가 직접.
- 단순 implementation은 예외로 Claude에게 위임 가능 — 단 위임한 순간 사용자는 그 코드의 멘탈 모델을 직접 만들지 못함.
- 다음에 그 코드를 만지거나 유사 패턴을 다른 곳에 적용할 때, 사용자가 빠르게 복원할 수 있는 "교과서"가 필요.
- 04-15 P1 fallback 작업에서 사용자가 명시적으로 "인지부채 태그로서 상세히 메모리에 기록"을 요청 → 표준 패턴으로 승격.

## How to apply

### 트리거
- 사용자가 "1번(직접 구현)" 또는 동등한 위임 결정을 내려 Claude가 코드를 작성한 경우.
- 단순 한 줄 fix가 아니라 **신규 state/hook/effect/메커니즘 추가**가 포함된 변경.

### 메모리 파일 구조
파일명: `project_{기능}_implementation.md`

frontmatter:
```yaml
---
name: {기능} 구현 (인지부채 태그)
description: {날짜} Claude 직접 작성. 다음 만지기 전 반드시 읽고 멘탈 모델 복원.
type: project
created: {date}
status: implemented (검증 단계)
cognitive_debt: HIGH
---
```

본문 필수 섹션:
1. **⚠️ 인지부채 태그 — 읽기 전 주의** (Claude 작성 사실, user_self_coding_goal 정책 언급, 학습 우선순위)
2. **무엇을 했나** (파일 단위 변경 요약)
3. **핵심 메커니즘 N개** (각 메커니즘은 "왜 이렇게 했나" + 코드 흐름 추적 + 대안 비교)
4. **회귀 위험 체크리스트** (코드 만질 때 깨지지 말아야 할 invariant)
5. **트레이드오프 / 보류** (디자이너 미확인 부분, 백엔드 의존, 후속 작업)
6. **관련 메모리** (선행 결정, race 학습, 기존 정책 등)

### MEMORY.md 등록
⭐ 진행 중 섹션에 한 줄로 등록하되, 일반 작업 라인과 구분되게 "인지부채 HIGH" 표기.

### 검증 완료 시
- frontmatter `status` 업데이트
- 본문 "검증 미완" 섹션 → 통과 결과로 교체
- MEMORY.md 라인의 status 표기도 함께 갱신

## 사례
- wiki `p1-feed-pagination-auto-fallback-high` (pattern, 04-15) — 첫 표준 적용. 5개 메커니즘(sticky-per-mount, onErrorRef, 콜백 vs watch, 한 mount 1회 보장, 401/403 호환), 회귀 위험 5가지.

## 안티패턴
- "구현했다" 한 줄 메모로 끝내기 → 인지부채 누적, 다음에 만질 때 git blame부터 시작해야 함.
- 메커니즘 없이 파일명만 나열 → "뭘 했는지"는 보이지만 "왜 그렇게 했는지"가 빠짐.
- 사용자가 작성한 코드까지 인지부채 태그 → 오버. 사용자 작성은 일반 project 메모.
