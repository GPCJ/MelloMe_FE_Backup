---
name: 댓글 UI 코드 리뷰 — 04-09 1순위 작업
description: 2026-04-08 댓글/대댓글 UI 코드 리뷰 결과. 04-09 첫 작업으로 처리 예정.
type: project
---

**⭐ 04-09 1순위 작업**

## 리뷰 결과 요약

### 🔴 즉시 수정 (근본 원인)
- **`CommentWritePage` `h-dvh` 문제**: Layout(`<main>`) 안에서 렌더되는데 `h-dvh`(100dvh) 적용 → 상단 헤더(56px) + 100dvh로 하단 입력창이 화면 밖으로 밀려남. `h-dvh` 대신 다른 방식으로 레이아웃 잡아야 함.

### 🟡 후속 수정
- **페이지 헤더 스크롤 영역 안에 위치**: CommentWritePage/CommentDetailPage 둘 다 페이지 헤더(← 댓글 달기)가 `overflow-y-auto` 스크롤 영역 안에 있어서 스크롤 시 사라짐. sticky 처리 필요.
- **`pb-24` 고정값**: CommentDetailPage에서 하단 입력창 없을 때도 항상 96px 여백 적용됨.
- **글로벌+페이지 헤더 중복**: 디자이너가 검토 중. 보류.

**Why:** 2026-04-08 UI 점검 중 발견. h-dvh가 Layout 내부에서 뷰포트 기준으로 동작해 레이아웃 깨짐.
**How to apply:** 04-09 세션 시작 시 /check-memory 실행하면 이 항목 1순위로 안내.
