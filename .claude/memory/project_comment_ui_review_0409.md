---
name: 댓글 UI 코드 리뷰 — 04-09 작업 완료
description: 04-08 코드 리뷰에서 발견된 h-dvh, pb-24 이슈 → 04-09 MobileFixedBottom 도입으로 전부 해결
type: project
originSessionId: d1067864-12df-4a7d-aed3-5e225ac5e869
---
## 리뷰 결과 요약

### ✅ 완료
- **`CommentWritePage` `h-dvh` 문제**: MobileFixedBottom(position:fixed) 도입으로 자연 해소 → h-dvh + flex 중첩 구조 제거, 플랫 구조로 변경
- **`pb-24` 고정값**: CommentDetailPage에서 `showReplyInput` 조건부 처리 (`pb-24` / `pb-6`)
- **페이지 헤더 공통화**: MobilePageHeader 컴포넌트로 추출 완료 (커밋 c336ca0)
- **모바일 키보드 대응**: useKeyboardHeight + MobileFixedBottom으로 키보드 위 입력창 고정

### 보류
- **글로벌+페이지 헤더 중복**: 디자이너가 모바일/PC 별도 디자인 예정

**Why:** 04-08 UI 점검 중 발견된 레이아웃 이슈들. 근본 원인은 fixed 대신 flex 레이아웃으로 하단 입력창을 배치했던 것.
**How to apply:** 모바일 하단 고정 UI가 필요하면 MobileFixedBottom 컴포넌트 사용할 것.
