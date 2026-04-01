---
name: 홈 피드 리디자인 완료 (2026-04-01)
description: 피그마 기반 홈 피드 UI 리디자인 완료 상태 및 검색 모드 설계 결정
type: project
---

## 완료 항목
- PostSummary 타입 확장 (commentCount, hasAttachment, authorProfileImageUrl, authorVerificationStatus, isBlurred)
- PostCard 컴포넌트 별도 분리 (`components/PostCard.tsx`)
- PostListPage 리디자인 — 탭(전체 피드/팔로우) + 필터칩 + 리스트형 피드
- Layout 하단 네비 3탭 (홈/글쓰기/프로필)

## 검색 모드 설계 결정
- `/search` 별도 라우트가 아닌 **PostListPage 내 `isSearchMode` 상태 전환** 방식
- 검색 아이콘 클릭 → 탭 사라지고 검색 입력창 표시, 필터칩+PostCard 영역 유지

**Why:** 피그마 검색 결과 UI가 피드와 거의 동일한 레이아웃이므로 같은 페이지 내 모드 전환이 자연스러움.

**How to apply:** 검색 구현 재개 시 이 설계 따를 것. 검색 전 UI는 디자이너 미완성 상태.

## 보류/대기
- 검색 모드 구현 — UI 껍데기만, 내일 이어서
- 데스크탑 헤더 글쓰기 버튼 위치 — 디자이너 답변 대기
