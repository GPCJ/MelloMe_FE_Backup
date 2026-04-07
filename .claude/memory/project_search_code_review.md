---
name: 검색 기능 코드 리뷰 + 학습 진행 상태
description: 04-06 SearchPage 코드 리뷰 결과와 코드 파악 진행 상태 — 04-07 세션 시작 시 브리핑용
type: project
---

## 검색 기능 코드 리뷰 (04-06)

### 구조
- 진입점 2개: PostListPage 데스크탑 검색바 → `/search?q=`, Layout 모바일 검색 아이콘 → `/search`
- SearchPage에서 `fetchPosts`에 `keyword` 파라미터로 API 호출
- MSW 핸들러: keyword 필터링 미구현

### 발견된 이슈

**버그/정확성:**
1. **[높음] therapyArea/sortType URL 미동기화** — 로컬 state만 관리, URL에 반영 안 됨 → 새로고침/공유 시 필터 초기화
2. **[중간] 빈 검색 가능** — therapyArea 선택 시 keyword 없이도 검색 실행 (의도 확인 필요)
3. **[낮음] MSW keyword 필터링 미구현**

**잠재적 문제:**
4. **[중간] race condition (AbortController 부재)** — 빠른 연속 검색 시 느린 이전 요청이 결과를 덮어쓸 수 있음
5. **[중간] stale closure 위험** — useEffect에서 doSearch 호출 시 eslint-disable이 위험을 숨김
6. **[낮음] currentPage 이중 관리** — state + doSearch 파라미터 양쪽

**UX:**
7. 데스크탑 검색바 빈 값 Enter 시 피드백 없음
8. 뒤로가기 `/posts` 하드코딩

### 코드 파악 진행 상태

사용자가 SearchPage 코드를 아직 충분히 파악하지 못한 상태. 전체 흐름 + state 구조 요약까지 읽음.

**다음 단계로 제안된 학습 포인트:**
- inputRef와 keywordRef 두 개가 필요한 이유
- doSearch와 executeSearch 분리 이유
- useEffect 2개의 역할

**Why:** 검색 기능을 어제 급하게 만들어서 코드 이해도가 낮음. 수정보다 이해를 먼저 하고 싶다는 의사.

**How to apply:** 04-07 세션 시작 시 이 내용을 브리핑하고, 이해 → 수정 순서로 진행.
