---
name: 백엔드 dev/prod 서버 분리 + Vercel 2브랜치 매핑
description: 2026-04-29 staging/prod URL 수신 + Vercel main/develop 매핑 결정 (브랜치별 환경변수 분리)
type: project
created: 2026-04-29
updated: 2026-04-29
originSessionId: 471e1311-e0e3-4555-81b6-38f3f73186b6
---
## 서버 URL (2026-04-29, 같은 날 2회 갱신)

| 환경 | URL | 비고 |
|---|---|---|
| **prod** | `https://api.melonnetherapists.com/` | HTTPS |
| **staging** (1차, 폐기) | `http://43.201.120.96:8080/` | HTTP, IP 직접 |
| **staging** (2차, 현재) | `https://api-staging.melonnetherapists.com/` | HTTPS 정식 서브도메인 |

1차 → 2차 이동으로 mixed content 제약 자연 해소. Vercel preview(HTTPS)에서도 staging 호출 가능.

## 프론트 매핑 결정 (2026-04-29)

```
main 브랜치 push    → Vercel Production → www.melonnetherapists.com → prod API
develop 브랜치 push → Vercel Preview    → preview URL              → staging API
로컬 dev (port 3000) → .env.local       → localhost:3000           → staging API
```

Vercel 환경변수 `VITE_API_BASE_URL`을 Production/Preview 환경별 분리 등록. 같은 코드를 환경변수만 다르게 두 번 빌드.

**Why:** 백엔드 환경 분리 + 팀원 WIP 공유 + 로컬 staging 디버깅을 Vercel 기본 기능으로 일괄 해결. AWS 이전 동기 약화.

**How to apply:**
- prod 회귀 의심 시 staging URL로 재현 시도가 1차 액션
- 팀원 검증은 develop preview URL 공유 (브랜치 URL 고정)
- 데이터 쓰기 작업은 develop preview에서만 검증 → staging DB만 영향

## AWS 이전과의 관계

dev/prod 분기는 Vercel 환경변수 + 2브랜치로 해결됨. AWS 이전은 별도 트리거(bandwidth/compliance/cloud 통합) 발생 시 검토. 본 작업은 이전 동기 아님.

## 활용 시나리오

- staging에서 multipart 500 3건(이미지 업로드 / `POST /therapist-verifications` / `POST /me/profile-image`) 재현 시도
- staging 정상 → prod-only 환경변수 누락 (S3 credentials 등) 가설 검증
- staging도 동일 500 → 백엔드 코드 회귀 가설 강화

## 한계점

- 모든 비-main 브랜치(feature 등)도 자동 Preview 환경에 배포되어 staging API 호출. 프로젝트 운영 규약으로만 통제 (Vercel Custom Environments는 Pro 기능).
- preview URL은 인증 없는 공개 URL — 민감 데이터 노출 우려 시 Vercel password protection 검토.
- AWS 이전 시 동일 매핑을 GitHub Actions로 직접 구축 필요 (Vercel 락인은 아님).
