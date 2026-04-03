---
name: 프론트엔드 아키텍처 점검 (04-03 Before)
description: 프론트 코드 아키텍처 6개 관점 점검 결과 — After 적용 시점 판단용
type: project
---

04-03 백엔드/디자이너 의존 작업 대기 중, 프론트 코드 전체 아키텍처 점검 실시 (Before 완료).

**점검 결과:** MVP 규모에 적절한 구조. "당장 문제" 아닌 "확장 전 정리할 것" 수준.

**After에서 적용할 개선 포인트:**
1. 페이지 컴포넌트(PostDetailPage 412줄, PostListPage 245줄) 데이터 로직 → 커스텀 훅 분리
2. axiosInstance refresh가 자기 자신 호출 → plain axios 사용으로 변경
3. PostDetailPage navigate(-1) → 안전한 fallback 적용
4. Layout.tsx mockAnnouncements 하드코딩 정리

**Why:** 백엔드 API 미확정 상태에서 구조 변경하면 이중 작업 발생 가능. Before만 기록하고 기능 추가 시점에 맞춰 적용.

**How to apply:** 새 기능 추가로 페이지 파일이 비대해질 때, 이 목록 기준으로 리팩토링 착수.
