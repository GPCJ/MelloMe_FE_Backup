# 코딩 드릴 가이드

> AI 없이 직접 코드를 작성하는 데일리 루틴.
> 목표: 현재 능력의 경계를 확인하고, 매일 조금씩 넓히기.

---

## 루틴 구조 (하루 1~2시간)

| 단계 | 시간 | 내용 |
|------|------|------|
| 1. 읽기 | 15분 | 오늘의 대상 파일을 열고 코드 흐름을 따라감. "이 컴포넌트는 어떤 props를 받고, 어떤 상태를 관리하고, 어떤 순서로 렌더링되는가?" |
| 2. 설명 | 10분 | 파일을 닫고, 해당 파일의 동작을 글로 설명. 머릿속에서 코드 구조를 재구성 |
| 3. 구현 | 45~60분 | 빈 파일에 AI 없이 직접 작성 |
| 4. 비교 | 10~15분 | 원본과 비교. "몰라서 못 쓴 것" vs "다르게 쓴 것" 구분 |
| 5. 기록 | 30초 | `coding-drill-log.md`에 3줄 기록 |

### 구현 단계 규칙

- ✅ 공식 문서(React, MDN, Tailwind 등) 참고 OK
- ✅ 기존 프로젝트 다른 파일 참고 OK
- ❌ AI에게 묻기 금지
- ❌ 구글에서 "react OO 예제" 복붙 금지

---

## 1주차: 진단 테스트

현재 능력의 경계선을 찾기 위해 난이도를 섞어서 진행.

| Day | 파일 | 줄 수 | 포인트 |
|-----|------|-------|--------|
| 1 | `components/ProtectedRoute.tsx` | 9 | 워밍업, 루틴 자체에 익숙해지기 |
| 2 | `pages/WelcomePage.tsx` | 37 | 간단한 페이지 구조 + JSX |
| 3 | `pages/LandingPage.tsx` | 116 | 조건 분기 + 상태 연동 |
| 4 | `pages/LoginPage.tsx` | 162 | 폼 + 상태관리 + API 호출 |
| 5 | `stores/useAuthStore.ts` | 23 | Zustand 상태 관리 (선택) |

### 1주차 끝나면

- ★ 평균을 계산해서 2주차 난이도 조정
- ★★★ → 해당 난이도 건너뛰기
- ★★☆ → 비슷한 수준 반복
- ★☆☆ → 한 단계 아래에서 기초부터

---

## 난이도별 파일 풀

### 초급 (구조 이해)

- `components/ProtectedRoute.tsx` (9줄)
- `components/GuestRoute.tsx` (9줄)
- `components/AuthRoute.tsx` (8줄)
- `components/ui/skeleton.tsx` (13줄)
- `components/ui/label.tsx` (18줄)
- `components/ui/textarea.tsx` (18줄)
- `components/ui/input.tsx` (20줄)
- `components/ui/checkbox.tsx` (27줄)
- `components/ui/badge.tsx` (52줄)
- `components/ui/button.tsx` (58줄)

### 중급 (비즈니스 로직)

- `stores/useAuthStore.ts` (23줄)
- `pages/WelcomePage.tsx` (37줄)
- `pages/VerificationCompletePage.tsx` (57줄)
- `components/RichTextEditor.tsx` (74줄)
- `components/ui/card.tsx` (103줄)
- `pages/LandingPage.tsx` (116줄)
- `components/Layout.tsx` (166줄)

### 상급 (복합 페이지)

- `pages/SignupPage.tsx` (143줄)
- `pages/HomePage.tsx` (157줄)
- `pages/LoginPage.tsx` (162줄)
- `pages/PostCreatePage.tsx` (165줄)
- `pages/PostEditPage.tsx` (177줄)
- `pages/PostListPage.tsx` (236줄)
- `pages/TherapistVerificationPage.tsx` (248줄)

### 최상급 (전체 시스템 이해)

- `pages/MyPage.tsx` (310줄)
- `pages/PostDetailPage.tsx` (352줄)

---

## 핵심 규칙

1. **AI 사용 금지** — 구현 단계에서 AI에게 묻지 않기
2. **완벽하지 않아도 OK** — 50%만 짜도 성공. 목표는 "어디까지 되는지 확인"
3. **하루 1파일** — 욕심내서 2개 하지 말 것. 루틴의 지속성이 핵심
4. **주간 노션 업로드** — 주 1회 `/update-drill` 커맨드로 로그를 노션에 정리

---

## 평가 기준

- ★☆☆: 구조만 잡고 세부 구현 대부분 못 함 (30% 미만)
- ★★☆: 절반 정도 혼자 완성, 일부 로직에서 막힘 (30~70%)
- ★★★: 거의 다 혼자 완성, 사소한 차이만 있음 (70% 이상)
