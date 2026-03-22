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

## 배포 완료까지 남은 작업 (2026-03-20 기준)
1. ~~apex DNS 전파 완료 → Vercel Refresh~~
2. ~~백엔드 HTTPS 완료 대기~~ ✅ 완료
3. ~~Google OAuth 도메인 등록~~ ✅ 완료
4. ~~백엔드 CORS 허용~~ ✅ 완료
5. ~~vercel.json 프록시 제거~~ ✅ 완료
6. **[대기 중]** Vercel 대시보드 `VITE_API_BASE_URL` → `https://api.melonnetherapists.com/api/v1` 변경 + 재배포
7. **[대기 중]** 백엔드 circular reference 이슈 해결 대기
8. 로그인 테스트 → 게시글 CRUD → 마이페이지 테스트
9. 게시글 19개 시딩 스크립트 실행

**How to apply:** 배포 관련 작업 시 이 파일 기준으로 진행 상황 파악.
