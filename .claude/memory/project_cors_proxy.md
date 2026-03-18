---
name: CORS 프록시 설정 (미동기화)
description: Vercel 프록시로 CORS 우회 설정 — WSL2에는 있지만 맥북에 미동기화
type: project
---

WSL2에서 `frontend/vercel.json`에 Vercel 프록시 rewrite 설정을 추가해 CORS 문제를 우회함. 맥북 로컬은 아직 동기화 안 됨.

**맥북 현재 vercel.json (SPA 라우팅만 있음):**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**WSL2에 추가된 프록시 설정 (예상):**
```json
{
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://api.melonnetherapists.com/api/v1/:path*"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
→ `/pull-mello` 후 실제 내용 확인 필요.

**동작 원리:** 브라우저 → Vercel 서버(/api/v1/...) → 백엔드(api.melonnetherapists.com) 로 중계. 서버-서버 통신이라 CORS 없음. 프론트 코드에서는 `VITE_API_BASE_URL=/api/v1`만 사용.

**Why:** 백엔드 CORS 설정(`CORS_ALLOWED_ORIGINS`)에 `https://www.melonnetherapists.com` 추가했지만 컨테이너 재시작 여부 불확실. 프론트에서 Vercel 프록시로 임시 우회.

**How to apply:** 다음 작업 시작 전 `/pull-mello` 또는 git pull로 WSL2 변경사항 동기화 먼저 할 것. 이후 로그인 테스트 재시도.
