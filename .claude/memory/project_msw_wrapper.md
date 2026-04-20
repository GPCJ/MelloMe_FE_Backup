---
name: MSW 래퍼 + axios 인터셉터 수정 완료
description: 백엔드 ApiResponse 래퍼에 맞게 axios 인터셉터와 MSW 핸들러 일괄 수정
type: project
---

백엔드 응답이 `{ success: true, data: ... }` 래퍼 구조임을 확인하고 프론트 코드 수정 완료 (2026-03-19).

**MSW Vercel 활성화 완료 (2026-03-20):**
- `main.tsx`에서 `import.meta.env.DEV &&` 조건 제거 → `VITE_MSW_ENABLED=true`만으로 ON/OFF 제어
- Vercel 환경변수 `VITE_MSW_ENABLED=true` (All Environments) 이미 설정 확인
- main 브랜치 push 완료 → Vercel 자동 재배포로 팀원 체험 가능 상태
- MSW가 켜지면 콘솔에 네트워크 에러 안 뜨는 것이 정상 (mock이 요청 가로채기 때문)

**변경 내용:**
- `axiosInstance.ts` — response 인터셉터 추가: `success === true`이면 `response.data.data`로 자동 언래핑
- `handlers.ts` — auth, posts, comments, reactions 핸들러에 `{ success: true, data: ... }` 래퍼 추가
- `/home`, `/meta/options`, `/me/dashboard`, `/me/posts`, `/me/activity`는 yaml에 ApiResponse 없어서 래퍼 미적용

**Why:** openapi yaml 기준 거의 모든 엔드포인트가 ApiResponse 래퍼를 사용. 전역 인터셉터로 처리하는 게 깔끔.

**How to apply:** 새 API 핸들러 추가 시 ApiResponse 래퍼 여부는 openapi yaml 확인 후 결정.
