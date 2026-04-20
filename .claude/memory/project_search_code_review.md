---
name: 검색 기능 코드 리뷰 + C+A 개선 전략
description: SearchPage 코드 리뷰 결과(8개 이슈)와 C+A 개선 전략 — Pagination 추출 완료, FilterChips 미진행
type: project
---

## 검색 기능 코드 리뷰 (04-06~07)

### 발견된 이슈 (8개)

**버그/정확성:**
1. **[높음] therapyArea/sortType URL 미동기화** — 로컬 state만 관리, 새로고침/공유 시 필터 초기화
2. **[중간] 빈 검색 가능** — therapyArea 선택 시 keyword 없이도 검색 실행
3. **[낮음] MSW keyword 필터링 미구현**

**잠재적 문제:**
4. **[중간] race condition (AbortController 부재)**
5. **[중간] stale closure 위험** — useEffect에서 eslint-disable이 위험을 숨김
6. **[낮음] currentPage 이중 관리** — state + doSearch 파라미터 양쪽

**UX:**
7. 데스크탑 검색바 빈 값 Enter 시 피드백 없음
8. 뒤로가기 `/posts` 하드코딩

### 추가 발견 (04-07)
- **`searched` state 불필요** — `results === null`로 대체 가능 (중복 상태)
- useState 8개 중 `therapyArea`, `sortType`, `currentPage`는 URL searchParams로 통합 가능 (이슈1 해결과 동시)

## 개선 전략: C + A 조합

**방안 C** (공통 컴포넌트 먼저 추출) + **방안 A** (새 코드부터 적용) 채택.

### 즉시 실행
1. ~~**`Pagination` 컴포넌트 추출**~~ — **완료** (04-07, 커밋 32ac85a)
2. **`FilterChips` 컴포넌트 추출** — 미진행

### MVP 이후
- 커스텀 훅 분리 (`useSearch`)
- URL searchParams 통합 (이슈1 근본 해결)
- 기존 페이지 수정 시 같이 구조 정리

**Why:** 코드 리뷰에서 유지보수성 문제를 발견했지만, 팀 일관성과 MVP 일정을 고려해 점진적 접근 선택.
**How to apply:** 다음은 FilterChips 추출. MVP 이후 이슈 목록 참고하여 점진적 리팩토링.
