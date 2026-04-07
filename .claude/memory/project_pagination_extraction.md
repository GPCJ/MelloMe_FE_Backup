---
name: Pagination 공통 컴포넌트 추출 완료
description: SearchPage/PostListPage 페이지네이션을 공통 컴포넌트로 추출 완료 (04-07)
type: project
---

## 완료 (04-07, 커밋 32ac85a)

`components/Pagination.tsx` 생성 — SearchPage + PostListPage에서 재사용.

- `getPageNumbers` 유틸 함수 포함 (ellipsis 지원)
- props: `currentPage`, `totalPages`, `onPageChange`
- 스타일: SearchPage 기준 통일 (`rounded-full`, 미니멀)
- 무한 스크롤 구현 시 대체 예정 (MVP 범위)

**Why:** C+A 개선 전략의 첫 번째 실행 단계. 중복 코드 제거 + 스타일 통일.
