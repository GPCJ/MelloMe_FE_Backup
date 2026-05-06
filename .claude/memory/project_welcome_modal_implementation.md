---
name: 회원가입 환영 모달 구현 (2026-05-06)
description: 회원가입 직후 /posts로 navigate + 환영 모달이 피드 위에 1회 노출되는 X/Threads 패턴 구현 결정과 Why
type: project
originSessionId: d7966e96-641e-4634-8a56-ba846785409b
---
# 회원가입 환영 모달 구현 (2026-05-06)

회원가입 완료 시 게시글 피드(`/posts`)로 이동하면서 그 위에 환영 모달이 떠 즉시 컨텐츠 진입과 치료사 인증 유도를 동시에 달성. X/Threads의 첫 진입 패턴.

## 결정 1: 라우트 분리 X, 피드 위 모달

**채택**: 회원가입 → `navigate('/posts')` + 모달이 `/posts` 위에 뜸
**대안 기각**: 별도 `/welcome` 라우트 또는 SignupPage 내부 인라인 풀스크린 UI

**Why**:
- 시안 의도(피드 백그라운드)와 정합
- 메모리 `랜딩페이지 폐기 결정 (2026-05-06)`(비로그인 `/signup`/로그인 `/posts` 라우팅)과 정합
- 사용자가 즉시 컨텐츠를 볼 수 있어 이탈 방지

## 결정 2: localStorage 신호 (vs location.state vs Zustand)

**채택**: `localStorage.setItem('mello:welcome-pending', '1')` — SignupPage가 set, PostListPage가 마운트 시 read+delete
**대안 기각**:
- `useLocation().state` — 새로고침 시 사라져 일관성 X
- Zustand store — MVP 범위 외, persist 미들웨어 추가 필요

**Why**: 페이지 이동·새로고침 견고. 다탭 동시성은 MVP 범위 외라 무시.

## 결정 3: shadcn Dialog 미설치 → 직접 fixed overlay

**채택**: `<div role="dialog" aria-modal="true" aria-labelledby="welcome-title">` + `fixed inset-0 z-50 bg-black/50`로 직접 구현
**Why**: 의존성 추가 회피(메모리 `feedback_dependency_blast_radius.md` 정합). a11y 속성 직접 부여.

## 결정 4: trigger는 SignupPage 한 곳만 (isNewUser 미연동)

**채택**: 회원가입 직후만 모달 노출. LoginPage에서 첫 로그인 시 노출은 미구현.
**Why**: 백엔드 `isNewUser` 응답값 정상 여부 미확인(backlog B-06). 검증 후 후속 작업으로 분리.

## 한계점 박제

1. **isNewUser 미연동**: 다른 디바이스/세션에서 첫 로그인 시 모달이 안 뜸. B-06 백엔드 검증 후 LoginPage 트리거 추가로 보완 가능
2. **localStorage 가드의 한계**: 시크릿 모드/캐시 클리어 시 한 번 더 노출될 수 있음. MVP 허용 범위
3. **PostListPage Hot Path 적층**: useEffect 1개 + state 1개 + 핸들러 2개 추가. 무한스크롤/필터/RQ와는 격리됐지만 페이지 책임 영역이 7개로 늘어남 → R-11 (리팩토링 옵션 A/B/C 비교, 채택 미결정) 박제
4. **본문 1줄 카피 자체 교정**: 시안 "치료사들**를** 위한"을 한국어 조사 자연스럽게 "치료사들**을** 위한"으로 변경. 사용자 판단으로 디자이너 통보 생략 결정(2026-05-06)

## 변경 파일

| 파일 | 변경 |
|---|---|
| `frontend/src/components/auth/WelcomeModal.tsx` | 신규 |
| `frontend/src/pages/auth/SignupPage.tsx` | inline 환영 UI 삭제 + localStorage set + navigate('/posts') |
| `frontend/src/pages/post/PostListPage.tsx` | useEffect 마운트 1회 트리거 + 모달 렌더 |

## 후속 작업

- backlog R-11 (PostListPage 리팩토링, 옵션 A/B/C 비교 채택 미결정) — 내일 1순위 박제
- backlog B-06 (isNewUser 검증 후 LoginPage 트리거 추가)
