---
name: 모바일 상단 헤더 리팩토링 진행 상황
description: MobilePageHeader 추출 완료, Layout 모바일 헤더 숨김, 디자이너 별도 디자인 예정
type: project
---

## 완료

- MobilePageHeader 공통 컴포넌트 추출 (커밋 c336ca0) — props: title, backTo
- Layout 헤더 모바일 숨김 처리 (`hidden md:block`)
- PostListPage 탭 sticky 위치 수정 `top-0 md:top-14` (커밋 04ef58e)

## 대기

- 디자이너가 모바일/PC 상단 헤더를 **별도 디자인**하기로 함 — 디자인 확정 후 모바일 전용 상단 헤더 구현 필요
- 모바일 헤더 숨김으로 인한 추가 UI 깨짐 디버깅 진행 중

**Why:** 모바일/데스크탑 헤더 기능 중복(홈 이동, 프로필 등) 정리 목적. 하단 nav와 역할 분리.
**How to apply:** 디자이너 시안 확정 시 모바일 상단 헤더 구현. sticky top 값 하드코딩 주의.
