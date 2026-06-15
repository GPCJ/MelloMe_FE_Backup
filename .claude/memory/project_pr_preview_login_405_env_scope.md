---
name: project_pr_preview_login_405_env_scope
description: "PR 프리뷰 URL 로그인 405 = VITE_API_BASE_URL 미주입(스코프), 코드 문제 아님 — 재발 시 알릴 것"
metadata: 
  node_type: memory
  type: project
  originSessionId: c445a978-dab9-4550-a5ad-38199f61705c
---

PR(feature 브랜치) 프리뷰 배포 URL에서 로그인 시 **405 Method Not Allowed**가 뜨는 건 알려진/방치 결정된 현상이다 (2026-06-09 확인).

**증상**: 네트워크 탭 Request URL이 `https://mellomefe-git-<branch>-...vercel.app/auth/login` (백엔드 아님, `/api/v1` 접두사도 없음). 백엔드 응답 없음.

**원인**: `VITE_API_BASE_URL`이 일반 Preview 스코프엔 미설정 → 프리뷰 빌드 때 undefined → `axiosInstance.ts:7` baseURL undefined → `/auth/login`이 프론트 자기 도메인으로 POST → Vercel 정적 호스팅이 POST 거부(`vercel.json` rewrite는 GET 전용) → 405. 백엔드 도달 안 함. **코드 문제 아님, 순수 배포 환경변수 스코프 문제.**

**왜 develop은 정상?**: `VITE_API_BASE_URL`이 develop 전용(branch override 또는 staging 환경)으로만 걸려 있음. PR merge되어 develop 배포로 재빌드되면 변수 주입돼 정상 작동.

**사용자 결정**: 그냥 둠(PR 단계 로그인 QA 불필요). **재발하면 "이전에도 있었던 의도된 상태"라고 사용자에게 알릴 것.**

**살리려면(미적용)**: Vercel Settings → Env Vars에서 `VITE_API_BASE_URL`(+`VITE_MSW_ENABLED=false`)을 일반 Preview 스코프로 추가 + 재배포. 단 백엔드 CORS가 `*.vercel.app` 프리뷰 도메인 허용해야 함(2차 용의자).

관련: [[project_backend_dev_prod_split]] [[project_env_vars]] [[project_auth_cache_invariant]]
