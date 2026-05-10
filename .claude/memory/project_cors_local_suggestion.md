---
name: 로컬 CORS 허용 완료
description: 백엔드가 localhost:3000, localhost:5173 CORS 허용 적용 — 로컬에서 실서버 API 직접 테스트 가능
type: project
originSessionId: 44b6a841-89d3-4371-8363-31644f339aa7
---
백엔드 CORS에 `http://localhost:3000`, `http://localhost:5173` 허용 적용 완료 (2026-04-22 컨펌).

**Why:** 이전에는 Vercel 배포 URL만 허용돼서 매 변경마다 push → 배포 → 테스트 루프를 돌아야 했음. 로컬 허용으로 피드백 루프 단축.

**How to apply:**
- 로컬 `npm run dev`에서 `api.melonnetherapists.com`으로 직접 호출해 실서버 동작 검증 가능.
- MSW 우회하고 실서버 붙일 때 별도 CORS 조치 불필요.
- 실서버 테스트 필요 항목(이미지 업로드 → PostDetailPage 반영, PATCH /me 스펙 등)은 이제 로컬에서 바로 확인 가능.

## 2026-04-29 staging 백엔드 drift 발견 (prod와 별개 정책)

prod CORS와 staging CORS는 별개 정책으로 운영됩니다. 메모리 cache vs 실측 비교 결과:

| origin | prod | staging |
|---|---|---|
| `https://www.melonnetherapists.com` | ✅ | ✅ |
| `http://localhost:3000` | ✅ | ✅ |
| `http://localhost:5173` | ✅ | ❌ (drift, 2026-04-29 발견) |
| `https://mellomefe-git-develop-ringo-waffles-projects.vercel.app` | N/A | ✅ (2026-04-29 추가 완료) |

### 우회 (프론트 측)
Vite 기본 5173 포트는 staging 차단되므로 dev 포트를 3000으로 강제 고정 (`vite.config.ts` `strictPort: true`, 커밋 `262b565`).

### Lesson
"메모리 cache vs 실측" 차이가 또 발생 (5173 미허용 발견). CORS 정책은 환경(prod/staging)별로 별도 검증 필요 — 한 번 기록한 메모리가 모든 환경에 그대로 적용된다고 가정 금지.

## 2026-05-10 실측 — 사실상 3000만 허용

세컨더리 worktree에서 dev를 5173에 띄웠더니 백엔드 호출 차단됨. 사용자 확인: 현재 실제 CORS allowlist는 **`http://localhost:3000`만 허용**. 5173/5174는 prod도 차단으로 좁아진 것으로 추정.

**우회**: 두 번째 세션에서 dev 띄울 때는 포트 3000을 점유하지 못하면 `.env.local`에 `VITE_MSW_ENABLED=true`로 MSW 모드 사용 → CORS 우회 + 실서버 무관.
