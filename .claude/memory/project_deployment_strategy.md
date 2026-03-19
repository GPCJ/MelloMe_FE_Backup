---
name: 배포 전략 변경 — Vercel 중단, AWS 통합 배포
description: 프론트엔드를 Vercel 대신 AWS에 배포하여 백엔드와 통합
type: project
---

Vercel 사용 중단. 프론트엔드도 AWS에 배포하여 백엔드와 통합 운영 예정.

**Why:** Vercel(HTTPS) ↔ 백엔드(HTTP) Mixed Content 문제로 프로덕션 API 동작 불가. AWS 통합 배포로 해결.

**How to apply:** 배포 관련 작업 시 Vercel 기준이 아닌 AWS 기준으로 안내. `vercel.json` 등 Vercel 설정은 더 이상 유지하지 않아도 됨.
