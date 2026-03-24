---
name: Notion 트러블슈팅 #002 작성 예정 (axios interceptor)
description: CRUD 완료 후 axios interceptor로 토큰 자동 주입 해결한 내용을 Notion에 기록 예정 — 조건 충족됨
type: project
---

CRUD 기능 개발 완료. Notion 트러블슈팅 페이지(#002)에 아래 내용 작성 필요.

**작성할 내용:**
- 문제: CRUD API 호출마다 Authorization 헤더에 토큰 수동 주입 → 코드 중복
- 해결: axios 도입 + axiosInstance request interceptor → 모든 요청에 Bearer 토큰 자동 주입
- 핵심 개념: axios interceptor 동작 방식

**Why:** 취업 포트폴리오용 기술 경험 기록
**How to apply:** 다음 Notion 업데이트 시 함께 작성 제안할 것. 트러블슈팅 페이지 URL: https://www.notion.so/322c8200749b81f39f71f9c8a4d6eb44
