---
name: CRUD 완료 후 Notion 트러블슈팅 기록 예정
description: CRUD 개발 완료 후 axios interceptor로 토큰 자동 주입 해결한 내용을 Notion 트러블슈팅 페이지에 작성 예정
type: project
---

CRUD 기능 개발이 완료되면 Notion 트러블슈팅 페이지(#002)에 다음 내용을 디테일하게 작성할 것.

**작성할 내용:**
- 문제 상황: CRUD API 호출 시마다 Authorization 헤더에 토큰을 수동으로 주입해야 하는 코드 중복 문제
- 원인 분석: fetch를 직접 사용할 경우 헤더 주입 로직이 API 함수마다 반복됨
- 해결 과정: axios 도입 + axiosInstance에 request interceptor 설정 → 모든 요청에 자동으로 Bearer 토큰 주입
- 핵심 개념: axios interceptor 동작 방식

**Why:** 취업 포트폴리오용 기술 경험 기록
**How to apply:** CRUD 개발 완료 시점에 Notion 트러블슈팅 페이지 작성 제안할 것. 트러블슈팅 페이지 URL: https://www.notion.so/322c8200749b81f39f71f9c8a4d6eb44
