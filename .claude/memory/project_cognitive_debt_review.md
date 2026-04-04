---
name: 인지부채 점검 세션
description: 프로젝트 인지부채 해소를 위한 이해도 점검 — 아직 시작 전, 영역 선택 단계
type: project
---

## 배경
jin24님이 현재 프로젝트(멜로미)에 대해 "정말 심도있게 이해하고 있는가?"라는 걱정을 느끼고 있음.
Claude가 생성한 코드가 많아지면서 인지부채가 쌓인 상태.

## 점검 방식 합의
- Claude가 질문하고 jin24님이 답하는 방식으로 실제 이해도를 점검
- 모르는 부분이 나오면 그때 같이 짚어가기

## 점검 대상 영역 (아직 선택 전)
1. **코드 흐름** — 로그인~게시글 CRUD 데이터 흐름
2. **구조/아키텍처** — 폴더 구조, 라이브러리 선택 이유
3. **내가 안 짠 코드** — Claude가 생성한 코드 중 "일단 넘어간" 부분
4. **설정/인프라** — Vite, Tailwind, axios interceptor 등 설정 파일

## 트러블슈팅 인지부채 (이해 후 #004~#006 작성 예정)
- **#004** — GuestRoute/ProtectedRoute 타이밍 충돌: `navigate` → `setAuth` 순서 문제 (**개념 이해 완료 2026-03-29**)
- **#005 후보** — 치료사 인증 API multipart/form-data 연결 과정 (2026-03-25 구현했지만 아직 이해 못함)
- **TIL 예정 (2026-03-30)** — `useUnknownInCatchVariables`: catch 블록 에러가 `any`→`unknown`으로 바뀐 이유, strict 모드 포함, 타입 좁히기 강제 개념 학습함
- **#005** — welcome 리다이렉트 버그: 근본 원인은 `navigate` → `setAuth` 순서였음. **코드 수정 완료 2026-03-29**: `SignupPage.tsx`에서 `setAuth` 먼저 호출 후 `navigate` 순서로 교체, `App.tsx`에서 `/welcome` + `/verification-complete`에 `AuthRoute` 추가. 닉네임 플래시 및 비인증 접근 문제도 함께 해결.
- **#006 후보** — 401 인터셉터 구조 전체 (`axiosInstance.ts`): isRefreshing 플래그, waitingQueue, _retry, plain axios vs axiosInstance 분리 이유 (2026-03-27 구현, **개념 이해 완료 2026-03-27**)
  - 이해한 것: 401 vs 403 구분, Request vs Response 인터셉터 차이, isRefreshing = UI 무관 단순 플래그, waitingQueue = FIFO 아닌 대기 보관용 배열, refresh는 1번만 호출 후 큐 전체 한꺼번에 재시도
  - 코드는 다른 기기에서 구현 후 미push 상태 → 내일 push 후 확인 필요
- → `/update-builders` 실행 시 이 항목들 이해했는지 먼저 확인하고 리마인드할 것

## 인지부채 추가 항목

- **#007 후보** — 리액션 API 리팩토링 (2026-03-30): `likePost`/`unlikePost` → `getReaction`/`toggleReaction` 교체, `ReactionType` enum 변경, `PostReaction` 인터페이스 추가. 소스코드 흐름 이해 필요.
- **#008** — `POST /auth/refresh` 동작 원리: refresh 토큰 사용 조건(401 발생 시), 과정(axiosInstance interceptor), 결과(새 accessToken 저장 + 실패 요청 재시도) 전체 흐름 이해 필요.

- **#009** — 마이페이지 3종 탭 데이터 흐름: `ProfilePage.tsx` → `api/mypage.ts` → `types/mypage.ts` 3레이어 구조. 탭별 독립 상태(data/page/loading/error) + useEffect 트리거 + 페이지네이션 패턴. 탭 클릭 시에만 해당 API 호출되는 흐름 복습 필요.

## 다음 세션에서 할 일
- jin24님이 어떤 영역부터 시작할지 선택
- 해당 영역에 대해 Q&A 방식으로 이해도 점검 시작
