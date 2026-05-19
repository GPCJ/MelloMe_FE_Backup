---
name: ""
description: "소크라테스식 학습 체크인 시 답변/질문 형식 — 구체 API류는 코드 발췌로, React 모델류는 추상 설명으로"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6a4255e6-1481-4e7d-96e5-4c6e8f2479e2
---

소크라테스식 학습 체크인(`[[feedback_learning_gap_socratic_checkin]]`) 진행 시, 답변과 변형 질문의 **형식**을 사용자 학습 효율에 맞춰 두 갈래로 운용한다.

## 갈래 1: 구체 API/문법/속성 — "코드 발췌 + 키워드 박제 + 변형 질문"

다음 류의 주제는 **반드시 코드 4~10줄을 발췌해서 (A)(B)(C) 라벨링하고**, 답변 안에 키워드·API명을 굵게 박제한 뒤, "이 줄을 빼면?" 또는 "다른 hook으로 바꾸면?" 같은 **변형 질문**으로 마무리한다.

- 특정 hook/메서드 사용법 (`useLayoutEffect` vs `useEffect`, `ResizeObserver.observe/disconnect` 등)
- 특정 CSS 속성/Tailwind 클래스 사용법 (`line-clamp-3`, `break-words`, `overflow-wrap: anywhere` 등)
- DOM API (`scrollHeight` vs `clientHeight` 등)
- 이벤트 핸들러 분기 (`e.preventDefault()`, `e.stopPropagation()` 등)

## 갈래 2: React 모델·메커니즘 — "추상 설명 + 비유 + 표"

다음 류의 주제는 **코드 예시가 오히려 이해를 방해**한다 (사용자 명시 2026-05-19). 비유, 표, 핵심 룰 박스로만 박제한다.

- Component / Element / Instance 구분
- 인스턴스별 state·effect·ref 독립성
- `key`와 인스턴스 식별 메커니즘
- 리렌더 트리 흐름 (위→아래)
- React 내부 동작 모델 (Fiber, bailout 등)

## Why

사용자 자기 진단(2026-05-19): "소크라테스 체크는 좋은데 코드를 안 보니까 추상 원리만 이해되고, '이 경우엔 이 속성·키워드를 쓰면 되는구나' 같은 코드 단위 이해가 향상 안 됨."

→ **구체 API류에는 코드 발췌로 손맛**을 주고, **추상 모델류에는 비유로 머릿속 이미지**를 주는 게 둘 다 만족된다. 한쪽 방식만 고집하면 다른 쪽이 약해진다.

## How to apply

1. 답변 직전, 주제가 갈래 1인지 갈래 2인지 분류
2. 갈래 1이면 코드 발췌 + (A)(B)(C) 라벨 + 키워드 굵게 + 변형 질문
3. 갈래 2이면 비유 + 표 + "핵심 룰 박제" 박스
4. 갈래 1·2 혼합 주제면 둘 다 — 단, 갈래 2 부분은 코드 빼고 추상으로
5. 변형 질문은 매 사이클 1개 이내 — 인지부담 관리

## 관련

- 트리거 조건: [[feedback_learning_gap_socratic_checkin]] (AI 50%+ 작업 후)
- 사용자 흡수 기준: [[user_comprehension_criterion]] (이미지/구조 떠올라야 흡수)
- 학습 막힘 포인트: [[user_learning_blocker_unknown_params]] (의미 모르는 파라미터)
