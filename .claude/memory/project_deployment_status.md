---
name: 배포 진행 상황
description: Vercel + EC2 배포 구조 확정 및 남은 작업
type: project
---

## 확정된 배포 구조
- 프론트: Vercel → `www.melonnetherapists.com`
- 백엔드: EC2 → `api.melonnetherapists.com`

**Why:** MSW 시연용으로 Vercel 배포해둔 것을 그대로 사용하기로 결정.

## 완료된 항목
- apex DNS 전파 + Vercel Refresh ✅
- 백엔드 HTTPS ✅
- Google OAuth 도메인 등록 (`/auth/callback` 2개) ✅
- `VITE_GOOGLE_CLIENT_ID` Vercel 환경변수 설정 ✅
- 백엔드 CORS 허용 ✅
- `vercel.json` 프록시 제거 ✅

## 남은 작업
1. **[대기 중]** Vercel 대시보드 `VITE_API_BASE_URL` → `https://api.melonnetherapists.com/api/v1` 변경 + 재배포
2. **[백엔드 대기]** CORS OPTIONS 403 이슈 해결 대기 (Spring Security preflight 차단)
3. 로그인 테스트 → 게시글 19개 시딩 → 전체 기능 테스트

**How to apply:** 백엔드 CORS 수정 완료 알림 받으면 1→2→3 순서로 진행.
