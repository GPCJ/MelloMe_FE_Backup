---
name: Vercel SPA 라우팅 404 해결법
description: React Router SPA를 Vercel에 배포할 때 /signup 등 직접 접근 시 404 발생하는 문제와 해결법
type: feedback
---

CSR SPA(React Router)를 Vercel에 배포할 때는 반드시 `vercel.json`에 fallback rewrite 설정이 필요하다.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Why:** 로컬 Vite dev server는 모든 경로에 index.html을 자동 반환하지만, Vercel은 정적 파일 서버라서 `/signup` 같은 경로에 실제 파일이 없으면 404를 반환한다. React가 실행되기 전에 404가 나므로 React Router가 동작할 기회가 없다.

**How to apply:** Vercel 신규 배포 시 `vercel.json` 위치 주의 — **Vercel Settings → General → Root Directory** 설정 기준 폴더 안에 있어야 함. 이 프로젝트는 Root Directory가 `frontend`로 설정되어 있으므로 `frontend/vercel.json`에 위치해야 함. 레포 루트에 두면 무시됨. Nginx, Apache 등 다른 정적 서버에서도 동일한 원리로 fallback 설정 필요.
