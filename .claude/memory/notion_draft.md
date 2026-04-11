---
name: 노션 업로드 대기 초안
description: 다른 기기에서 노션에 올릴 초안 — pull-mello 후 확인
type: project
originSessionId: 10d34c19-4a2c-439b-9267-b37d1d65b635
---
# TIL — 서브 페이지 추가 (2026-04-11)

**위치:** TIL 페이지 하위 서브 페이지로 추가
**URL:** https://www.notion.so/323c8200749b80c2bbe6caf194055593

## 서브 페이지: 2026-04-11 — Swagger 스펙 정렬 + MSW 구조 재정비

**분류**: TypeScript / React / AI활용

### 오늘 한 것
- **스펙 정렬 P0~P2 완료**: 백엔드 Swagger 변경사항(title/ageGroup 삭제, visibility/scrapped 추가) 프론트 전체 반영
  - types/post.ts 타입 정렬, Visibility 타입 추가
  - fetchPosts/mypage API 함수에서 불필요한 fallback 매핑 제거
  - PostCreatePage/PostEditPage/ProfilePage에서 삭제된 필드 참조 정리
  - TherapyArea 라벨 5개 추가 (감각통합/물리/미술/음악/행동)
  - MeResponse에 커뮤니티 접근 관련 필드 3개 추가
  - 미사용 HomePage.tsx 발견 → 삭제
- **MSW 환경 재정비**: 729줄 단일 파일을 도메인별로 분리
  - data/ 폴더: mock 데이터 분리 (posts, comments, users)
  - handlers/ 폴더: 9개 도메인별 핸들러 파일 (auth, posts, comments 등)
  - state.ts: 핸들러 간 공유 상태 분리
  - mock 응답도 Swagger 스펙에 맞게 정렬 (items, postType, visibility, scrapped)

### 배운 것 / 인사이트
- handlers.ts가 729줄인 사실을 처음 인지 — 코드 복잡도를 정기적으로 점검하는 습관 필요
- MSW mock 데이터가 실제 API 스펙과 다르면 개발 중 혼란이 생김 → 스펙 변경 시 mock도 같이 업데이트
- deep-interview(OMC 스킬)로 요구사항을 먼저 정리하니 작업 범위가 명확해져서 삽질 없이 진행됨

### 포트폴리오 어필 포인트
- API 스펙 변경에 따른 프론트엔드 전수조사 + 체계적 정렬 (P0→P1→P2 우선순위 기반)
- 단일 파일 729줄 → 도메인별 모듈화 리팩토링으로 유지보수성 개선
