---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /post-notion-draft로 업로드 가능.
type: draft
updated: 2026-04-29
originSessionId: current
---

# staging 서버 분기 + 로컬 dev 환경 변경 (.env.local 채택)

날짜: 2026-04-29
분류: 인프라 / 개발환경
임팩트: GitHub push 없이 로컬에서 staging API를 직접 호출 가능해짐. MSW 의존 없이 실제 백엔드 응답으로 multipart 500 등 회귀 검증 가능.

---

## 1. 배경

prod에서 발생한 multipart 500 에러 3건(이미지 업로드, `POST /therapist-verifications`, `POST /me/profile-image`)을 재현하려면 실제 백엔드 응답이 필요했습니다. 그러나 로컬에서는 MSW로만 테스트해 왔습니다. prod 백엔드는 CORS에서 `localhost` origin을 거부하기 때문입니다.

이 상황에서 백엔드 측이 staging 서버를 별도로 띄워 주었고, 로컬에서 staging을 호출할 수 있다면 push-deploy 사이클 없이 바로 디버깅 환경을 만들 수 있게 됩니다.

## 2. staging URL 수신 이력

같은 날(2026-04-29) 두 차례 변경되었습니다.

1차: `http://43.201.120.96:8080/`

- HTTP, IP 직접, 포트 8080
- Vercel 배포(HTTPS) 환경에서는 mixed content로 차단되어 사용 불가
- 로컬 dev 한정으로만 의미 있는 상태

2차: `https://api-staging.melonnetherapists.com/`

- HTTPS, 정식 서브도메인
- mixed content 제약 자동 해소
- 추후 Vercel preview 환경에서도 호출 가능한 잠재력 확보

## 3. CORS 정책 검증

curl로 staging의 CORS 응답 헤더를 직접 확인했습니다.

| Origin | 결과 |
|---|---|
| `https://www.melonnetherapists.com` | 허용 (`Access-Control-Allow-Origin` echo) |
| `http://localhost:3000` | 허용 (echo) |
| `http://localhost:5173` | 차단 (`403 Invalid CORS request`) |
| `https://staging.melonnetherapists.com` | 차단 |

발견 사실: Vite 기본 포트인 5173은 staging의 CORS allowlist에 포함되어 있지 않습니다. 기존 프로젝트 메모리에는 "백엔드가 5173/3000 둘 다 허용 (2026-04-22 컨펌)"으로 기록되어 있었으나, 실측 결과 staging에는 5173이 빠져 있었습니다. 메모리와 실제 정책의 drift입니다.

대응 옵션 두 가지를 비교했습니다.

A. 프론트 dev 포트를 3000으로 강제

- 수정 범위: `vite.config.ts` 한 줄
- 백엔드 대기 없음
- 즉시 진행 가능

B. 백엔드 CORS allowlist에 5173 추가 요청

- 정책 일관성 회복 측면에서 더 깔끔
- 백엔드 배포 freeze 상태 확인 필요
- 시간 소요

당장의 디버깅 목적에 A가 충분하다고 판단해 A로 진행했습니다.

## 4. 적용한 변경

`frontend/vite.config.ts`

```ts
server: {
  port: 3000,
  strictPort: true,
  proxy: { /* 기존 그대로 */ },
}
```

`strictPort: true`는 3000 점유 시 다른 포트로 fallback 하지 않고 즉시 실패시키기 위함입니다. 조용한 사고(다른 포트로 떠서 staging이 차단) 방지가 목적입니다.

`frontend/.env.local` (신규)

```
VITE_API_BASE_URL=https://api-staging.melonnetherapists.com/api/v1
VITE_MSW_ENABLED=false
```

`.env.local`은 `.gitignore`에 이미 포함되어 있어 자동으로 추적에서 제외됩니다.

검증: `npx vite` 실측으로 `http://localhost:3000/` 기동 확인, `tsc -b` 통과.

## 5. `.env.local` vs `.env.development.local` 선택 결정

Vite는 시작 시점에 `.env`, `.env.[mode]`, `.env.local`, `.env.[mode].local` 네 패턴을 우선순위(뒤가 앞을 덮음)로 병합합니다. 본 작업의 목적인 "dev에서만 staging URL 사용"은 두 파일 모두로 달성 가능합니다.

선택 결과: `.env.local`

선택 이유

1. 컨벤션. Vite/Next.js/CRA 생태계에서 "개인용 override"의 표준 이름이 `.env.local`입니다. 다른 개발자가 레포를 봤을 때 즉시 의도를 인지할 수 있습니다.
2. gitignore 이중 커버. `frontend/.gitignore`(명시적 라인)와 루트 `.gitignore`(`*.local` 와일드카드)가 둘 다 잡고 있어 commit 사고 마진이 큽니다.
3. 현재 워크플로우에 실제 차이가 없습니다. dev는 로컬에서, prod 빌드는 Vercel CI에서만 수행합니다. Vercel 빌드 머신에는 `.env.local` 파일이 존재하지 않으므로 prod 산출물에 영향이 없습니다.

## 6. 한계점 (합리화로 가려두지 않기)

`.env.local`은 모든 mode에서 로드됩니다(`test` mode 예외). 즉, 로컬에서 `npm run build`를 직접 실행하는 순간 `.env.local`이 prod 빌드에도 적용되어 산출물 `dist/`에 staging URL이 박히게 됩니다.

```
npm run build  (mode=production)
  → .env (prod URL) 로드
  → .env.local (staging URL) 로드 ← 덮음
  → dist/ 안에 "staging URL이 박힌 prod 빌드"
```

발생 가능한 시나리오는 한정적입니다.

- prerender 빌드 hang 같은 빌드 이슈를 로컬에서 재현할 때
- Vercel 배포 전 산출물을 미리 검증하고 싶을 때

이때 dist가 거짓말을 합니다. Vercel CI 산출물과 로컬 산출물이 다른 도메인을 가리키기 때문에, "로컬에서는 작동하는데 배포본은 깨진다"류의 혼선을 만들 여지가 있습니다.

대안: 파일명을 `.env.development.local`로 rename하면 dev mode에서만 로드되어 이 함정 자체가 사라집니다. 다만 현재 본 프로젝트는 로컬 prod 빌드를 일상적으로 하지 않으므로 함정에 빠질 빈도가 매우 낮다고 판단해 `.env.local` 유지를 선택했습니다. 만약 로컬 빌드 검증이 잦아진다면 그 시점에 rename하는 것이 합리적입니다.

## 7. 효과 요약

- GitHub push 없이 로컬에서 staging API 직접 호출 가능
- MSW를 우회한 실제 백엔드 응답으로 회귀 검증 가능 (multipart 500 재현 등)
- prod 배포 산출물에는 영향 없음 (Vercel CI는 `.env.local`을 보지 못함)
- 로컬 prod 빌드 시점에는 staging URL이 박히는 함정 존재 (한계점 명시)

## 8. 후속 작업

- staging에서 multipart 500 3건 재현 시도 (`FILE_STORAGE_ERROR` code 동일성 확인)
- 메모리 두 건 갱신 필요
  - `project_backend_dev_prod_split.md`: URL HTTPS로 변경, mixed content 우회 절 삭제
  - `project_cors_local_suggestion.md`: staging은 5173 미허용 사실 추가, prod도 재검증 권고
- 백엔드 CORS allowlist 일관성 회복(5173 추가) 여부는 다음 백엔드 대화에서 안건화

---

# Vercel 2브랜치 배포 매핑 (2026-04-29 동일 세션 후속)

날짜: 2026-04-29
분류: 인프라 / 배포 파이프라인
임팩트: GitHub push만으로 팀원이 WIP를 검증 가능. AWS 이전 없이 Vercel 기본 기능으로 dev/prod 환경 자동 분리.

---

## 1. 배경

`.env.local`로 staging API를 호출할 수 있게 된 직후 떠오른 후속 질문: "팀원이 WIP 어떻게 보나?" 로컬 `localhost:3000`은 본인 머신에만 바인딩되므로, GitHub push 없이는 다른 팀원이 작업물을 검증할 수단이 없었습니다. 검토한 옵션은 세 가지였습니다.

A. AWS S3 이전 후 staging/prod 버킷 분리 — 40~80h+, blast radius 큼.
B. ngrok/cloudflared 임시 터널 — 데모 1회용, 상시 운영 부적합.
C. Vercel 기본 기능(Production/Preview 환경) 활용 — 환경변수 설정만으로 가능, 추가 비용 0.

C 채택. AWS 이전은 본 문제 해결 동기로는 과도하다고 판단했습니다.

## 2. 동작 모델

Vercel은 "서버를 띄우는" 서비스가 아니라 빌드 결과물을 CDN에 올리는 서비스입니다. 같은 프로젝트 1개 안에서 환경변수를 다르게 주입해 두 빌드를 분리합니다.

```
main 브랜치 push    → Vercel Production → www.melonnetherapists.com → prod API
develop 브랜치 push → Vercel Preview    → preview URL (브랜치별 고정)→ staging API
```

서버 인스턴스 두 대를 운영하는 모델이 아닙니다 — 정적 파일 두 벌이 다른 도메인에 매달려 있는 구조입니다.

## 3. 적용한 변경

### Vercel Dashboard

Settings → Environment Variables에서 환경별 분리 등록.

| Key | Value | Environment |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.melonnetherapists.com/api/v1` | Production |
| `VITE_API_BASE_URL` | `https://api-staging.melonnetherapists.com/api/v1` | Preview |

### Git

```
main     ← prod 배포 대상 (PR merge 경로만)
develop  ← staging 검증 대상 (일상 작업)
```

기존 정책 "브랜치 main만 운영"은 폐기. main + develop 2브랜치 + feature는 PR 단위 임시로 갱신.

## 4. 팀원 공유 동선

```
1. 개발자가 develop에 push
2. Vercel이 자동 빌드 → preview URL 갱신 (브랜치 URL은 고정)
3. 팀원이 URL 클릭 → staging API 호출하는 빌드를 봄
4. 검증 OK → develop을 main으로 merge → prod 배포 자동
```

브랜치 URL은 commit이 바뀌어도 동일하게 유지되므로 팀원은 북마크 한 번으로 충분합니다. 커밋별 immutable URL도 자동 생성되지만 공유에는 사용하지 않습니다.

## 5. URL ↔ API 매핑

| 접속 URL | 호출 API | 누가 보나 | 데이터 안전성 |
|---|---|---|---|
| `localhost:3000` | staging | 본인만 | staging DB |
| preview URL (`*-git-develop-*.vercel.app`) | staging | 팀원 + 본인 | staging DB |
| `www.melonnetherapists.com` | prod | 실사용자 | 실 데이터 |

## 6. 한계점

- **모든 비-main 브랜치가 Preview 환경에 자동 배포됨.** develop뿐 아니라 feature 브랜치도 staging API를 호출합니다. Vercel Custom Environments(Pro 기능)로 엄격 분리 가능하지만 MVP 단계엔 운영 규약으로만 통제합니다.
- **preview URL은 인증 없는 공개 URL.** 누구든 URL만 알면 접근 가능. 민감 데이터 노출 우려 시 Vercel password protection 옵션 별도 검토.
- **AWS 이전 시 같은 매핑을 직접 짜야 함.** S3 + CloudFront + GitHub Actions 조합으로 동등 환경을 재구축 가능 (Vercel 락인은 아님).
- **모든 feature 브랜치가 staging DB를 더럽힐 수 있음.** 동시 검증 중인 브랜치가 많아지면 staging DB 상태 추적이 어려워질 수 있음.

## 7. 효과 요약

- 팀원이 GitHub push 1회로 WIP 검증 가능
- AWS 이전 없이 Vercel 기본 기능으로 dev/prod 환경 자동 분리
- 브랜치 URL 고정 → 팀원 북마크 1회로 검증 라이프사이클 종결
- prod 배포는 develop → main merge로만 트리거되어 안전성 유지

## 8. 후속 작업

- Vercel 환경변수 Production/Preview 분리 등록 (사용자 직접)
- develop 브랜치 첫 push 후 preview URL 패턴 확인
- (선택) `staging.melonnetherapists.com` 커스텀 도메인 alias로 preview 고정 URL 깔끔화
