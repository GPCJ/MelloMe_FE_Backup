---
name: react-2026-05-19
description: "사용자가 React 렌더링 단계와 Element/Instance 구분을 학습. 일부는 완료, Element/Instance 구분은 헷갈림 자각."
metadata: 
  node_type: memory
  type: user
  originSessionId: 6a4255e6-1481-4e7d-96e5-4c6e8f2479e2
---

## 학습 시점: 2026-05-19

PostCard "더 보기" 인라인 펼침 구현 중 useLayoutEffect/ResizeObserver 사용 → 자연스럽게 React 내부 모델로 확장된 학습.

## 잡힌 개념 (재설명 불필요, 응용으로 바로 가도 됨)

1. **useLayoutEffect vs useEffect** — paint 전/후 실행 차이. 콜백에서 setState로 시각 영향 주면 useEffect는 깜빡임, useLayoutEffect는 없음. "콜백에서 DOM 측정 후 즉시 state 바꾸는 패턴"에 useLayoutEffect.
2. **렌더 4단계** — render → diff → commit → paint. 사용자가 "의자 배치 도면/실제 의자/사람이 본 모습" 비유로 흡수.
3. **인스턴스별 state 독립** — `posts.map(post => <PostCard key={post.id} ... />)`에서 카드마다 별개 인스턴스, 한 카드 setState가 옆 카드에 영향 X.
4. **bailout** — setState로 같은 값을 넣으면 React가 `Object.is` 비교 후 렌더 skip. 정확히 3줄 분량 카드가 깜빡이지 않는 이유.
5. **key=id vs key=index 차이** — 이미 알고 있는 내용이라 사용자가 명시 박제 거부(2026-05-19).

## 아직 흐릿한 개념 (다음에 응용 마주치면 다시 확인)

- **Component / Element / Instance 3층 구분** — 사용자 표현: "다른 곳에서도 범용적으로 자주 쓰이는 용어라서 좀 헷갈리네." 비유는 잡혔지만 구체 코드 매핑에서 다시 정리 필요.
  - Element가 HTML 태그뿐 아니라 `<PostCard />` 같은 컴포넌트 호출도 포함한다는 점
  - Instance ≠ DOM 노드 (Instance는 React Fiber 살림, DOM 노드는 별개 층)
  - Element = 매 렌더마다 새로 만들어지는 휘발성 객체, Instance = 같은 위치/key면 유지되는 지속성

## 응용 트리거 (다음 세션에서 만나면 이 개념 끌어와 설명)

- "왜 모달 닫았다 열어도 입력값이 남아있지?" → Instance 지속성
- "왜 key 바꾸니까 입력값이 날아가지?" → Instance unmount + 새 mount
- "리렌더는 됐는데 화면이 안 바뀌네" → diff 후 DOM commit 없음
- "왜 한 댓글에 좋아요 눌렀는데 다른 댓글도 같이 빨개졌지?" → key 잘못 줘서 인스턴스 매핑 꼬임
- "왜 setState 했는데 리렌더가 안 되지?" → bailout 또는 같은 참조

## wiki 박제 여부

- 사용자가 명시적으로 wiki 박제 거절 (2026-05-19) — 완벽 이해 X 자각, 보충 받고도 흐릿하다고 함
- user 메모리(이 파일)는 학습 추적 목적이라 별개로 보존

## 관련

- 학습 협업 패턴: [[feedback_socratic_code_excerpt_pattern]] (구체 API는 코드 발췌, React 모델은 비유)
- 학습 트리거 정책: [[feedback_learning_gap_socratic_checkin]]
- 학습 흡수 기준: [[user_comprehension_criterion]] (이미지/구조 떠올라야 흡수)
