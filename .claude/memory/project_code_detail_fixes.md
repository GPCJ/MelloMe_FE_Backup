---
name: 리디자인 후 디테일 이슈 수정 + 인증 FNC 구현률 보강 (2026-04-02)
description: 리디자인 코드 품질 이슈 6개 수정, 인증 도메인 FNC 프론트 구현 가능 항목 보강 완료
type: project
---

## 리디자인 디테일 이슈 수정 (6개)
1. PostCreatePage "게시 하기" → "게시하기" 띄어쓰기 통일
2. NotFoundPage `bg-indigo-500` → `bg-gray-900` 색상 통일
3. SearchPage URL ?q= 검색 시 에러 삼킴 → error state + UI 추가
4. Layout "전체 공지사항 보기" dead link → "준비 중입니다" 텍스트
5. PostCard 스크랩 빈 버튼 → 비활성 span으로 변경
6. mypage.ts `fetchMyDashboard` dead code 제거

## 인증 FNC 구현률 보강
- FNC-001: 비밀번호 8자 검증, 409 에러 "이미 사용 중인 이메일" 분기
- FNC-002: 로그인 후 canAccessCommunity/미인증/반려 3분기 라우팅
- FNC-005: APPROVED/REJECTED/NOT_REQUESTED/UNDER_REVIEW 4상태 분기, 거절 사유 표시
- FNC-007: 파일 accept .webp 추가/.pdf 제거, 5MB 사이즈 제한, 안내 문구 수정

**Why:** 광범위 리디자인으로 디테일 누락 다수 발생. 인증 FNC는 프론트에서 즉시 가능한 항목 우선 처리.

**How to apply:** 이 항목들은 모두 완료됨. 추가 디테일 이슈 발견 시 같은 패턴으로 점검.
