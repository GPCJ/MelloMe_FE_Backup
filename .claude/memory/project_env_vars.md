---
name: 프로젝트 환경변수 설정값
description: Vercel 및 로컬 환경변수 확정값 — 배포/개발 환경 설정 시 참조
type: project
---

## Vercel 환경변수 (프론트엔드)

| 변수명 | 값 |
|--------|-----|
| `VITE_API_BASE_URL` | `https://api.melonnetherapists.com/api/v1` |

**Why:** 기존에 `/api/v1` 상대경로로 설정되어 있어 프론트 도메인(`www.melonnetherapists.com`)으로 API 요청이 가는 문제가 있었음. 절대 URL로 수정.

**How to apply:** Vercel 배포 환경변수 변경 시 이 값 기준으로. axiosInstance의 baseURL은 `VITE_API_BASE_URL`을 읽으므로 API 경로는 `/auth/login`, `/posts` 등 prefix 없이 작성.
