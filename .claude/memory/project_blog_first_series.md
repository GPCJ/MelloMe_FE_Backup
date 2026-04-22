---
name: 블로그 초기 글 계획 — 4편 로드맵
description: Velog 첫 글(바이브 코더 규칙) + useInfiniteFeed 2부작 시리즈 + AI 메모리 활용 글 로드맵
type: project
originSessionId: b72faa33-2e1e-455a-9261-22ce81a3715b
---
Velog 초기 4편 로드맵.

### 전체 순서
1. **1번째 글 (독립)**: 바이브 코더가 되지 않기 위해 신입 개발자가 실천하는 규칙 5가지 — 소스: `blog_draft_01_vibe_coder_rules.md`
2. **2번째 글 (시리즈 1부)**: useInfiniteFeed requestIdRef 패턴 — 소스: `blog_draft_02_infinite_feed.md`
3. **3번째 글 (시리즈 2부)**: useInfiniteQuery 마이그레이션 후기 — RQ 마이그레이션(백로그 R-01) 완료 후
4. **4번째 글 (독립)**: AI 시대 개발자가 AI 메모리 활용 방식을 알아야 하는 이유 — 1번째 글에서 분리한 ⑥⑦ 섹션 확장, 본인 `MEMORY.md` 인덱스 + 타입별 분리 사례 기반

### 상태
- [ ] 1번째 글 초안 작성 (바이브 코더 규칙)
- [ ] 1번째 글 Velog 발행
- [ ] 2번째 글 초안 작성 (useInfiniteFeed) — 학습 세션 후
- [ ] 2번째 글 Velog 발행
- [ ] RQ 마이그레이션 (백로그 R-01)
- [ ] 3번째 글 작성
- [ ] 4번째 글 초안 작성 (AI 메모리 활용)
- [ ] 4번째 글 Velog 발행

---

## 1번째 글 방향 확정 (2026-04-22)

**미니멀 버전으로 확정**:
- 구조: 짧은 도입 2~3줄 + 규칙 5개 + 짧은 맺음 3~5줄
- 제외: 체감 일화 섹션 / 메모리·AI 원리 섹션(→ 4번째 글로 이관)
- 이유: 제목("규칙 5가지")과 본문 일치, 첫 글 가독성, 발행 속도 우선
- 메모리 섹션 확장은 4번째 글로 독립화

**규칙 5개 순서 — 옵션 B (원칙 → 사고 프로세스 → 사후 관리)**:
1. 코드는 직접 쓴다 — AI는 힌트 제공자까지만
2. '해줘' 대신 '왜 이런지 진단해줘'부터 묻는다
3. AI 답변을 맹신하지 않고 직접 검증한다
4. AI가 쓴 코드엔 '왜' 주석을 달게 해서 학습한다
5. AI에 맡긴 부분은 '인지부채'로 플래그하고 복습한다

스켈레톤 파일(`blog_draft_01_vibe_coder_rules.md`) 내부 번호 재배치 완료.

---

## useInfiniteFeed 2부작 시리즈 상세

**Why:**
- `useInfiniteFeed`는 RQ 마이그레이션 예정 (백로그 R-01) → 폐기될 코드
- 폐기 예정이어도 "왜 RQ로 가는지"의 **실증 사례**로 오히려 설득력 있는 서사 가능
- "경험 → 한계 → 선택 → 검증" 완결 구조로 면접 평가 재료로도 강력

- 시리즈명 후보: "무한 스크롤 직접 구현기" / "React Query를 선택하기까지"

### 2번째 글 (시리즈 1부)
- 소스: wiki `useinfinitefeed-e-requestidref`, `useinfinitefeed-e-04-14`
- 스켈레톤 파일: `blog_draft_02_infinite_feed.md`
- 구조:
  1. 증상 — 스켈레톤 영구 표시
  2. 원인 — StrictMode + `hasInitializedRef` + `signal.aborted` 3단 콤보
  3. 해결 — `requestIdRef` 번호표 패턴 (E 패턴)
  4. 한계 인식 — "직접 관리 복잡, 캐싱/리페칭/dedup은 손도 못 댐"
  5. "그럼 처음부터 RQ 쓰지 그랬어?" 선제 대응
  6. 다음 편 예고 — 수업에서 배운 RQ가 잘 맞을 것 같아 적용 예정
- 핵심 메시지: "AbortController만으론 부족 — 애플리케이션 레벨 stale 체크 필요"
- 선행: 별도 학습 세션에서 개념 이해 완성

### 3번째 글 (시리즈 2부)
- 제목 후보: "useInfiniteQuery로 갈아탄 후기 — 100줄이 10줄이 되었다"
- 구조: 1부 회고 → Before/After 코드 비교 → 사라진 것(requestIdRef, inflightRef, finally 가드…) → 얻은 것(캐싱, 리페칭, dedup, devtools) → 판단 기준
- 트리거: 백로그 R-01 완료 시점
