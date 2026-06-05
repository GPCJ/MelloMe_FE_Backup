---
name: Zustand/RQ 등 reactivity 라이브러리 학습 패턴
description: Zustand/React Query처럼 "언제 무엇이 다시 그려지는가" reactivity 모델 위에 서 있는 라이브러리를 가장 어렵게 느낌. 단편 규칙 누적 학습 선호.
type: user
originSessionId: ae7aa7da-b987-4cb5-af3d-71635929aad2
---
사용자가 본인 입으로 명시한 학습 자세 + 어려운 도메인 자각.

**관찰:**
- 라이브러리 중 **Zustand와 React Query가 가장 어렵게 느껴진다**고 명시.
- 어려움의 핵심은 일반 React 컴포넌트 라이프사이클(props 바뀌면 리렌더)보다 한 층 더 깊은 **reactivity 모델** — 어떤 키를 구독했나, 캐시에 뭐가 있나, 어떤 mutation이 어떤 query를 무효화하나가 얽혀 있어 손에 안 잡힌다는 인식.
- 직접 코딩 모드 시작 이후 **이전 AI 작성 코드와 격차 자각**. "이전 zustand/RQ 코드는 본인이 작성한 게 아니라서" 추가로 어려움. 기존 `feedback_ai_written_code_cognitive_debt.md`와 정합되며 도메인 특정 보강.
- 학습 자세 명시: **"한 번에 큰 그림 잡으려고 안 해도 됨. 단편 규칙 누적이 결국 큰 그림"**.

**How to apply:**
- Zustand/RQ 코드를 가이드할 때 한 번에 reactivity 전체 모델을 설명하지 말 것. **단편 규칙 한 가지 단위**로 끊어 짚을 것. 예: "selector 패턴 — store 통째 destructuring vs `(s) => s.user` selector의 구독 범위 차이" 한 가지만.
- 직접 작성 모드에서도 동일 — 한 규칙씩 가이드한 뒤 사용자가 적용·확인하면 다음 단편으로.
- 사용자가 "이건 됐고 다음" 식으로 진행하면 그 흐름 존중. 한 단편씩 누적이 사용자가 선언한 학습 방식.
- 큰 그림(reactivity 모델 전체, 캐시 키 정책 등)을 한 번에 정리하려는 시도는 사용자 인지부채만 키움.

**누적 단편 규칙 — RQ vs store 판별 (2026-05-26 쪽지 학습 체크에서):**
- 규칙: **"fetch해서 페이지에 보여주는 목록 = React Query(pull) / 이벤트(SSE)로 갱신되고 전역에서 읽히는 카운트 = Zustand store(push)."**
- 사용자가 이 경계를 **2회 헷갈림**: ① 목록↔카운트를 역배치(목록=store, 카운트=RQ로 추측) ② 실시간 뱃지 갱신을 "RQ가 invalidate"로 설명. 공통 오개념 = **"서버에서 온 데이터 = RQ"로 과일반화**.
- 교정 포인트: server상태냐 client상태냐가 기준이 아니라 **pull(요청·캐시·페이지네이션)이냐 push(이벤트로 명령형 +1·전역 읽기)냐**. NotificationPage가 목록=`useQuery`, unreadCount=store로 정확히 이 분리를 보여줌 — 향후 정답지.
- 향후 소크라테스 체크 시 이 경계를 우선 강화.

**누적 단편 규칙 — zustand 셀렉터 콜백 문법 (2026-05-27 쪽지 UserActionDropdown 학습에서):**
- 사용자가 `useAuthStore((s) => s.user?.id)` **문법 자체**를 낯설어함 — "store 값을 함수 반환으로 받는다"까지는 직관이 맞았으나, **"내가 함수(셀렉터)를 zustand에 건네면 zustand가 전체 state를 `s`에 주입해 대신 호출하고 반환값을 돌려준다"**는 콜백 전달 구조를 새로 잡아줘야 했음. ("`s`는 누가 넣나?" → "zustand가 넣는다" 확인으로 닫힘.)
- 함께 잡은 구분: `getState()`=그 순간 한 번 찍는 **스냅샷(구독 X, 컴포넌트 밖용)** vs 훅 셀렉터=**구독**(반환값 바뀌면 리렌더). UserActionDropdown 본인/타인 분기가 로그인 상태 변화에 자동 반응하는 이유.
- 효과 있었던 비유: 냉장고(store) 통째로 받지 않고 "우유만 보여줘" 쪽지(셀렉터)를 건네면 zustand가 우유만 꺼내 줌. 향후 셀렉터 설명 시 재사용 가능.
- 이제 셀렉터 기본 문법은 체화됨 — 다음엔 기초 재설명 불필요, 캐시 키/무효화 등 상위 단편으로.

**누적 단편 규칙 — RQ 캐시 3종 (2026-06-04 쪽지 slice 2 자가 리뷰에서, 사용자 이해·확인 완료):**
- ① `placeholderData: keepPreviousData` — 쿼리키가 바뀌면(페이지/탭 전환) RQ는 새 쿼리로 보고 data가 잠깐 `undefined`가 돼 목록이 깜빡임. 이 옵션은 **새 키 데이터 도착 전까지 직전 키 데이터를 화면에 유지**해 깜빡임을 없앰. 비유=2페이지 가지러 간 사이 책상 위 1페이지를 안 치움.
- ② `invalidateQueries` **prefix 매칭** — 정확히 일치가 아니라 **그 키로 시작하는 모든 쿼리**를 잡음. `['messages']`만 주면 그 아래 received/sent/detail·모든 page가 일괄 무효화. 좁히려면 더 깊은 키(`['messages','received']`). 영향 범위를 모르면 공통 조상, 알면 좁게.
- ③ **active observer 반응** — 화면에 떠 있는(마운트된) 쿼리의 캐시를 invalidate/remove하면 그 observer가 변화를 감지해 **즉시 refetch**. 그래서 쪽지 삭제 직후 `invalidateQueries(['messages'])`(detail 포함)나 `removeQueries(detail)`를 하면 삭제된 쪽지를 다시 요청 → 404. 정답=**detail은 건드리지 말고 `navigate`로 언마운트시켜 observer를 없앤 뒤** 목록만 무효화. ("캐시를 어떻게 비우나"보다 "지금 그 쿼리를 누가 구독 중인가"가 핵심.)
- 사용자가 ①의 `keepPreviousData`를 처음 보고 질문 → 메커니즘 이해, ③의 404를 직접 디버깅 흐름으로 따라옴. RQ 학습이 "구독/캐시 키" 단계에서 "캐시 무효화 타이밍×observer 생명주기" 단계로 진입.
