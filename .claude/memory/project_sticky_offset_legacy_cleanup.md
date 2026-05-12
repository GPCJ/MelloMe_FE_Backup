---
name: sticky offset 잔재 정리 — Chrome 통일 정책 후속 (완료)
description: 2026-05-08 Chrome 통일(글로벌 헤더 폐기) 이후 코드에 남은 sticky top-14 잔재 정리. 2026-05-12 ProfilePage까지 정리 완료, 전 프로젝트 잔재 0.
type: project
originSessionId: cec5b2f0-901b-4f57-b53f-9d8e68a1d67c
---
Chrome 통일 정책(2026-05-08, Layout 글로벌 헤더 폐기)으로 PC 헤더가 사라졌지만, 일부 페이지의 sticky 컨테이너에 글로벌 헤더 시절의 오프셋 값(`top-14` = 56px, `md:top-14`)이 잔재로 남아 헤더가 뷰포트 56px 아래에 붙으며 그 위 영역이 빈 공간으로 보이는 회귀가 있었음.

**정리 이력**
- `frontend/src/pages/search/SearchPage.tsx:92` — `sticky top-0 md:top-14` → `sticky top-0` (PR #11, 2026-05-10)
- `frontend/src/pages/profile/ProfilePage.tsx:281` — `sticky top-14` → `sticky top-0` (2026-05-12, 메모리상 :306이었으나 line drift로 :281)

**현 상태**: `rg "(md:)?top-(14|12|16)"` 전 프로젝트 hit 0건. 잔재 정리 완료.

**Why**: chrome 정책 변경은 보통 한 PR로 끝나지 않고 페이지별 sticky/offset에 잔재를 남김. 정책 변경 직후 grep로 한 번 훑어두면 회귀를 사전 차단할 수 있음.

**How to apply**:
- 향후 Layout/PageHeader 등 chrome 변경 후에는 `rg "(md:)?top-(14|12|16)"` 같은 패턴으로 잔재 grep 1회 권장.
- 신규 sticky 컨테이너 만들 때 글로벌 헤더 가정 없이 `top-0` 기본으로 시작.
