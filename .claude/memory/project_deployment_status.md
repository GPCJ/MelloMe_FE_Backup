---
name: 배포 진행 상황
description: Vercel + EC2 배포 구조 확정 및 도메인 설정 현황
type: project
---

## 확정된 배포 구조
- 프론트: Vercel → `www.melonnetherapists.com`
- 백엔드: EC2 → `api.melonnetherapists.com`

**Why:** 원래 AWS 통합 배포 예정이었으나, MSW 시연용으로 Vercel 배포해둔 것을 그대로 사용하기로 결정.

## 도메인 설정 현황 (2026-03-15)
- `www.melonnetherapists.com`: Vercel Valid Configuration ✅
- `melonnetherapists.com` (apex): DNS 전파 대기 중 ⏳
- Google OAuth Redirect URI 추가 완료: `https://melonnetherapists.com/auth/callback`, `https://www.melonnetherapists.com/auth/callback` ✅
- `VITE_GOOGLE_CLIENT_ID`: Vercel 환경변수에 설정 완료 ✅

## 배포 완료까지 남은 작업 (2026-03-17 기준)
1. ~~apex DNS 전파 완료 → Vercel Refresh~~
2. ~~백엔드 HTTPS 완료 대기~~ ✅ 완료
3. ~~Vercel 환경변수 `VITE_API_BASE_URL` → `https://api.melonnetherapists.com/api/v1`~~ ✅ 완료
4. **[대기 중]** 백엔드 CORS 허용 — `https://www.melonnetherapists.com` 요청 완료, 수정 대기
5. ~~Google OAuth 도메인 등록~~ ✅ 완료
6. CORS 해결 후 → 로그인 테스트 → 게시글 CRUD → 마이페이지 테스트
7. 게시글 19개 시딩 스크립트 실행

## API 경로 미확인 사항
- 백엔드 실제 경로가 `/auth/login`인지 `/api/v1/auth/login`인지 확인 필요
- 현재 Vercel 환경변수: `https://api.melonnetherapists.com/api/v1` (CORS 해결 후 테스트로 확인)

**How to apply:** 배포 관련 작업 시 이 파일 기준으로 진행 상황 파악.
