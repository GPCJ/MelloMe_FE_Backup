---
name: 댓글 UI 코드 리뷰 — 04-09 1순위 작업
description: 2026-04-08 댓글/대댓글 UI 코드 리뷰 결과. 04-09 첫 작업으로 처리 예정.
type: project
---

## 리뷰 결과 요약

### 🔴 미해결
- **`CommentWritePage` `h-dvh` 문제**: Layout(`<main>`) 안에서 `h-dvh`(100dvh) 적용 → 하단 입력창이 화면 밖으로 밀려남. 이전 세션에서 Claude가 제안한 구조가 원인. 근본 수정 필요.

### 🟡 미해결
- **`pb-24` 고정값**: CommentDetailPage에서 하단 입력창 없을 때도 항상 96px 여백 적용됨.

### ✅ 완료 / 보류
- **페이지 헤더 공통화**: MobilePageHeader 컴포넌트로 추출 완료 (커밋 c336ca0)
- **글로벌+페이지 헤더 중복**: 디자이너가 모바일/PC 별도 디자인 예정. 보류.

**Why:** 2026-04-08 UI 점검 중 발견. h-dvh가 Layout 내부에서 뷰포트 기준으로 동작해 레이아웃 깨짐.
**How to apply:** h-dvh 근본 수정 + pb-24 조건부 적용 남아있음.
