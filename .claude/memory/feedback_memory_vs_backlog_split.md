---
name: 진행 상황은 backlog, memory엔 결정/Why만
description: /wrap-up 저장 시 체크박스·남은 작업·완료 여부 같은 가변 상태는 backlog.md로, memory엔 시간 불변의 결정·이유·제약만 저장해 stale 위험 회피
type: feedback
originSessionId: b38fad9d-2cf7-4029-b779-a2dd2d2da241
---
메모리에 진행 상황(체크박스, "남은 작업 A/B/C", "완료/미완료")을 저장하면 stale해지는 순간 거짓말하는 사실 소스가 됩니다. /wrap-up 저장 후보를 정리할 때 "시간에 따라 바뀌는 것"과 "바뀌지 않는 것"을 분리해 저장 위치를 다르게 잡습니다.

**Why:** 시스템 설계상 메모리는 frozen-in-time 스냅샷이고 쓰기 전 매번 현재 상태를 검증하도록 돼 있습니다. 실제로는 장기 축적되면 stale한 항목을 현재 사실처럼 다루게 됩니다. 반면 `backlog.md` 같은 체크박스형 문서는 작업하면서 자연스럽게 업데이트돼 항상 최신 상태 유지가 쉽습니다.

**How to apply:**

| 분류 | 저장 위치 |
|---|---|
| 결정(왜 이 설계), 제약, 정책, 사용자 선호, 트레이드오프 | **memory** (project/feedback/user/reference) |
| "남은 작업", "완료됨", 체크박스, 진행률, 확인일 | **`backlog.md`** |
| 유효기간 있는 선언 | **memory + sunset 날짜/트리거 필수** |

- /wrap-up 저장 후보가 "완료/남은 작업" 리스트를 포함하면 해당 부분은 backlog.md로 이관 제안
- memory 파일엔 결정의 Why + Sunset 트리거만 남김
- 본문 상세(섹션 구조, 테이블 같은 것)는 실제 소스코드 파일 참조로 대체

**예시 (2026-04-24 `project_privacy_policy_page.md` 리팩토링):**
- 기존: 완료 체크 4개 + 남은 작업 3개 + 본문 10섹션 나열 → stale 위험
- 개선: 결정 사항(라우트 위치, 링크 동작, 배너 정책) + Sunset 트리거(PM 검토 완료 시 전환) + backlog.md의 P 섹션 참조
