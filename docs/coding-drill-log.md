# 코딩 드릴 로그

드릴 v2(설계 설명 연습) — 주 2~3회 × 30분. 루틴 끝나고 아래 템플릿으로 기록.

```
## MM-DD — [대상 파일명]
- 질문: [고른 질문 2~3개 요약]
- 답변 요점: [자기 답변의 핵심 키워드 2~3줄]
- 막힌 부분: [흐릿했던 질문/개념 1줄]
```

---

> 아래는 v1(백지 재구현) 기간 로그 — 아카이브.

---

## 04-11
- 도전: `hooks/useReactionToggle.ts`
- 막힌 곳: toggling 가드 패턴을 렌더링용으로 오해, 훅 요약 시 핵심 로직(낙관적 업데이트/롤백) 누락
- 수준: ★★☆
- 메모: early return 가드 패턴, 훅 설명 시 "재사용" 뿐 아니라 핵심 로직도 언급하기

## 04-09
- 도전: `stores/useAuthStore.ts`
- 막힌 곳: 화살표 함수 객체 반환 문법, create() currying, persist 옵션 전달
- 수준: ★★☆
- 메모: 구조/키워드는 파악, Zustand 문법 세부 반복 필요

## 04-06
- 도전: `pages/LoginPage.tsx`
- 막힌 곳: -
- 수준: ★★★

## 04-03
- 도전: `pages/LandingPage.tsx`
- 막힌 곳: 원본 보면서 작성. 정적 텍스트/className 세부 기억 약함
- 수준: ★★☆
- 메모: JSX 내 expression 제약 학습, 반복 삼항 → 변수 추출 리팩토링 적용

## 04-02
- 도전: `components/ui/button.tsx`
- 막힌 곳: cva() 괄호 누락, export 빠짐
- 수준: ★★☆
- 메모: TS 문법 집중 — intersection type, VariantProps<typeof>, 제네릭, type import

## 04-01
- 도전: `pages/WelcomePage.tsx`
- 막힌 곳: (s) => s.user 셀렉터 문법
- 수준: ★★★
- 메모: 구현/비교 스킵 (늦은 시간). 구조 자체는 완전히 이해함

## 03-31
- 도전: `components/ProtectedRoute.tsx`
- 막힌 곳: Navigate 컴포넌트의 to, replace props 문법이 어색함
- 수준: ★★★
- 메모: 로직/구조는 술술 나옴. JSX 컴포넌트 props 문법 반복 필요

