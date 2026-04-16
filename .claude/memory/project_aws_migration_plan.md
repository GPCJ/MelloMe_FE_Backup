---
name: AWS 배포 이전 계획
description: Vercel → AWS 이전 예정. 프론트 담당 범위 확정 (빌드 전달, GitHub Actions workflow, 환경변수). 클라우드 개발자가 인프라 담당.
type: project
updated: 2026-04-16
originSessionId: a4f05cb8-3a07-44f2-8c8d-1d989156adf8
---
Vercel → AWS 배포 이전 예정 (시기 미정)

**Why:** 향후 인프라 통합 및 확장성 목적으로 AWS 이전 계획 있음

## 현재 배포 구조 (유지)
- Vercel 배포 소스: `origin` = `GPCJ/MelloMe_FE_Backup` (main 브랜치)
- airo 레포(`AIRO-offical/therapist_community_FE`)는 **private** → Vercel 무료 플랜 연결 불가 → 전환 보류

## 역할 분담
- **클라우드 개발자**: S3, CloudFront, Route 53, IAM 등 AWS 인프라
- **프론트(나)**: 아래 3가지

## 프론트 담당 범위
1. **빌드 결과물 전달** — `npm run build` → `dist/` 폴더, SPA 라우팅 설정 안내 (Vercel rewrites에 해당하는 것)
2. **GitHub Actions workflow 작성** — `.github/workflows/deploy.yml` (trigger → build → S3 upload → CloudFront 캐시 무효화)
3. **환경변수 관리** — `VITE_API_BASE_URL` 등 빌드 시점 주입 변수를 GitHub Actions Secrets에서 관리

## 학습 필요 사항
- GitHub Actions 문법 (trigger, job, step, secrets)
- workflow에서 AWS credentials 사용법
- 환경별 `.env` 분리 — `.env.development`, `.env.production` (Vite 모드별 자동 적용)

**How to apply:** AWS 이전 시점에 이 메모리 참고하여 workflow 작성 시작. 인프라 세팅은 클라우드 개발자에게 위임.
