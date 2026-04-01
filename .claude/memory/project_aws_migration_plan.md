---
name: AWS 배포 이전 계획
description: Vercel → AWS 이전 예정, GitHub Actions CI/CD YAML 작성 + 환경별 .env 분리 적용 필요
type: project
---

Vercel → AWS 배포 이전 예정 (시기 미정)

**Why:** 향후 인프라 통합 및 확장성 목적으로 AWS 이전 계획 있음

**How to apply:**
- `.github/workflows/deploy.yml` 작성 — GitHub Actions CI/CD 파이프라인 구성 (사용자가 도움 요청함)
- 환경별 `.env` 파일 분리 적용 — `.env.development`, `.env.production` 등 (Vite 모드별 자동 적용)
- AWS 호스팅 방식(S3+CloudFront, EC2 등) 확정 후 구체적인 파이프라인 구성
- 현재는 Vercel 환경변수로 관리 중, 이전 시 `.env.production` 분리 필요
