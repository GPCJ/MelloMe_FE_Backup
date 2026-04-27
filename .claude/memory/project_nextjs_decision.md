---
name: Next.js 도입 검토 결과 (2026-03-27)
description: Next.js 도입 논의 후 현 시점 보류 결정 — 재검토 조건 포함
type: project
originSessionId: 0027f8dc-b4af-49ab-b4da-1340a15224ea
---
2026-03-27 Next.js 도입 가능성 검토 후 보류 결정.

**Why:** 해결할 문제가 없는 상태에서 도입하면 마이그레이션 비용만 발생. 멜로미는 회원 전용 서비스라 SEO 필요성 낮고, MVP 일정 리스크 있음.

**How to apply:** Next.js 도입 제안이 나오면 이 결정 참고. 재검토 조건 충족 여부 먼저 확인.

---

## 결정

현 시점 보류. React + Vite 유지.

## 보류 이유

- 회원 전용 서비스 → SEO 불필요 (크롤러 노출 이점 없음)
- MVP 기능 개발 중 → 마이그레이션 비용이 일정 리스크로 작용
- 해결할 문제가 없는 기술 도입 → 포트폴리오/면접에서 근거 설명 불가

## 재검토 시점

- 콘텐츠를 비로그인으로 공개하는 기능 추가 시 (SEO 필요성 발생)
- MVP 완료 후 안정화 단계

---

## 2026-04-27 재평가 (보류 유지, 정량 근거 추가)

SEO 작업 진행 중 "결국 Next.js로 가야 하는 거 아닌가?" 압박이 다시 올라와 비용·리턴을 정량화함. 결과: **보류 유지**. 정량 근거를 남겨 향후 같은 질문이 재발할 때 즉시 참조 가능하게 함.

### 마이그레이션 비용 추정 (총 약 53시간 = 사이드 작업 병행 시 2~3주)

| # | 항목 | 시간 | 위험도 |
|---|---|---|---|
| 1 | Vite → Next.js 프로젝트 셋업 | 4h | 낮음 |
| 2 | 페이지 16개 → `app/` 디렉토리 매핑 | 8h | 중간 |
| 3 | `react-router-dom` API 24개 파일 치환 | 4h | 중간 |
| 4 | `GuestRoute`/`AuthRoute` → `middleware.ts` + `layout.tsx` 재설계 | 4h | 중간 |
| 5 | `'use client'` 경계 + Hydration mismatch 잡기 | 4h | 높음 |
| 6 | MSW Next.js 통합 (`setupServer` + `setupWorker`) | 6h | **높음** |
| 7 | TanStack Query SSR Hydration | 4h | 중간 |
| 8 | Zustand SSR 호환 | 2h | 중간 |
| 9 | 환경변수 14곳 + Vercel 재설정 | 2h | 낮음 |
| 10 | Tailwind v4 + Next.js 통합 | 2h | 중간 |
| 11 | GA4/Clarity → `next/script` 재작성 | 1h | 낮음 |
| 12 | 메타태그 → `metadata`/`generateMetadata` API | 2h | 낮음 |
| 13 | 회귀 테스트 + Hydration·MSW 디버깅 | 8h | **높음** |
| 14 | Vercel 빌드/배포 검증 | 2h | 낮음 |

### 보류 5가지 근거 (요약)

1. **크롤러 도달 페이지가 5개뿐** (`/`, `/login`, `/signup`, `/privacy`, `/terms`) — 게시글 비공개 정책 하에서 Next.js의 진가인 동적 SSR이 쓸 일이 없음
2. **옵션 2(`vite-plugin-react-ssg`)가 Next.js와 동일한 SEO 효용을 약 1/10 비용(4~6h)에 달성** — 정적 페이지 prerender만으로 카톡·네이버·구글 모두 진짜 HTML 인식
3. **공개 페이지 정책 미확정** — "미리 준비"한다고 마이그레이션 비용이 줄지 않음. 정책 변경 시점에 도입해도 비용 동일
4. **MSW 통합 리스크** — Vite는 한 줄(`worker.start()`), Next.js는 SSR/CSR 분리 필수. 53h 추정 중 6~10h가 이 디버깅에 잠식 가능
5. **MVP 우선순위** — REQ-001~012에 SSR 명시 없음. SEO 1단계·분석 인프라 모두 완료 상태

### 결론

옵션 2(`vite-plugin-react-ssg`)로 SEO 본질 해결 → 자세한 결정은 `project_seo_option2_decision.md` 참조. Next.js 재검토는 "게시글 비로그인 공개 정책 변경" 트리거 시점까지 보류.
