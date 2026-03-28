---
name: 월별 회고 — 2026년 3월
description: 2026년 3월 한 달간 멜로미 프로젝트에서 중점적으로 한 작업 요약
type: project
---

## 2026년 3월 — 멜로미 MVP 배포 & 인증 인프라 구축

### 이달의 핵심 테마
**"처음으로 실제 서비스처럼 돌아가게 만든 달"**
로컬 개발 수준에서 Vercel + EC2 실제 배포로 전환하고, 프론트-백엔드가 실제로 연결되어 동작하는 것을 처음 확인한 달.

### 주요 작업

**배포 인프라**
- Vercel(프론트) + EC2(백엔드) 배포 확정 및 완료
- 도메인: `www.melonnetherapists.com` / `api.melonnetherapists.com`
- CORS 이슈 해결 및 실제 로그인 테스트 통과

**인증 플로우 재설계**
- Google OAuth 제거 → 회원가입 + 치료사 인증 통합 플로우로 전환
- OAuthCallbackPage 구현 (`/auth/callback`)
- 401 인터셉터 구현 — isRefreshing 큐 패턴으로 Access Token 자동 갱신
- 환영 페이지 리다이렉트 버그 수정 (location state 패턴)

**UI 전면 개편**
- 피그마 와이어프레임 기반 전체 UI 개편 완료
- shadcn/ui 기반 컴포넌트 구조 정착
- 랜딩페이지 구현 + 인증 라우팅 구조 전면 개편
- 회원가입 온보딩 플로우 개편
- 치료사 인증 페이지 + 환영 화면 UI 구현

**코드 품질**
- MSW 래퍼 + axios 인터셉터 구조 정비
- 중복 코드 모듈화 (`constants/post.ts`, `utils/formatDate.ts`)

### 백엔드 협업
- API 스펙 불일치 12개 항목 정리 및 공유
- Refresh Token httpOnly Cookie 방식 확정
- `GET /me` 엔드포인트 추가 요청 반영

### 이달 미완료 (다음 달로 이월)
- `authorId` 필드 + `GET /me/posts` 백엔드 대기 중
- 치료사 인증 API 연결 미완료
- 마이페이지 API 3개 미구현 상태
- CORS OPTIONS 403 재발 이슈 백엔드 대기
