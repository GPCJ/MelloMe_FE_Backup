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

## 배포 현황 (2026-03-20 기준 — 사실상 완료)
1. ~~apex DNS 전파 완료 → Vercel Refresh~~ ✅
2. ~~백엔드 HTTPS 완료~~ ✅
3. ~~Google OAuth 도메인 등록~~ ✅
4. ~~백엔드 CORS 허용~~ ✅
5. ~~vercel.json 프록시 제거~~ ✅
6. ~~Vercel `VITE_API_BASE_URL` = `https://api.melonnetherapists.com/api/v1` 변경 + 재배포~~ ✅
7. ~~백엔드 circular reference 이슈 해결~~ ✅
8. ~~로그인 / 회원가입 실서버 연동 성공 확인~~ ✅
9. **[백엔드 구현 대기]** GET /me 동작 확인
10. **[백엔드 구현 대기]** 게시글 CRUD + 마이페이지 API 테스트

**How to apply:** 배포 관련 작업 시 이 파일 기준으로 진행 상황 파악.
