---
name: react-2026-05-19
description: "사용자의 React 내부 모델 학습 추적. 렌더 4단계/fiber=인스턴스/StrictMode 가짜언마운트/useEffect 동기화/비동기 race 도달성 잡힘(2026-05-20). Component·Element 층 구분만 미정리."
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

## 학습 시점: 2026-05-20 (심화 — 비동기 race 점검에서 확장)

리팩토링 백로그 R-02(useEffect stale-response 가드) 점검 중 "race가 왜/어디서 터지나"를 파다가 React 내부 모델로 깊게 확장. 면접 대비 동기. 단일 비유 체계(집=fiber/우편함=state/메모=ref/거주자 활동=effect)로 설명 시 빠르게 흡수 + 자기 말로 재진술 성공 → [[feedback_react_concept_layered_analogy]].

### 새로 잡힌 개념 (재설명 불필요)

1. **fiber = 인스턴스의 실체** — state·ref가 실제 저장되는 React 내부 객체. "컴포넌트 인스턴스 = 그 fiber". React 16에서 stack reconciler(동기 재귀, 중단 불가) → fiber reconciler(중단/재개 가능 작업단위)로 전환해 동시성 토대 마련. ⇒ 2026-05-19 "Instance 흐릿"이 여기서 해소(Instance = fiber).
2. **리렌더 ≠ 언마운트** — state 변동 시 fiber 유지한 채 함수만 재실행. fiber 파괴는 언마운트(트리에서 제거) 때만.
3. **StrictMode 가짜 언마운트 vs 진짜 언마운트** — 진짜=fiber 파괴(state·ref 소멸), StrictMode=fiber 유지하고 effect만 setup→cleanup→setup 재실행(ref 생존). 동시성(state 유지한 채 hide/show) 리허설이라 일부러 안 죽임. → 무한스켈레톤 버그가 이래서 터졌음(wiki `useinfinitefeed-e-requestidref`의 hasInitializedRef 생존).
4. **useEffect = 감지 아니라 대조** — 매 commit 후 deps를 직전 값과 얕게(Object.is) 대조해 다르면 (cleanup→setup). 능동 감시자 아님. 리렌더 없으면 안 돎(ref 직접 변경 미반영), 객체 리터럴 deps는 매 렌더 새 참조라 매번 실행. 본질은 "값 변화 반응"이 아니라 "deps에 맞춘 외부 동기화".
5. **이벤트 핸들러 vs effect** — 핸들러=유저 행동(onClick) 반응, effect=화면에 보이는 동안 외부 동기화. "유저 행동 트리거면 핸들러, 동기화면 effect".
6. **비동기 race 도달성 = 인스턴스 생명주기로 판단** — 같은 인스턴스 살아있으면 race(필터칩=searchParams 교체, 페이지 유지), 언마운트되면 죽은 인스턴스 setState가 no-op이라 무해(상세=목록 거쳐 인스턴스 교체). fetch(브라우저 세계)는 언마운트 무관하게 완료, setState(React 세계)만 무시.

## 아직 흐릿한 개념 (다음에 응용 마주치면 다시 확인)

- **Component / Element 층 구분** — Instance(=fiber)는 2026-05-20에 해소. 남은 건 Component/Element 층. 사용자 표현(2026-05-19): "다른 곳에서도 범용적으로 자주 쓰이는 용어라서 좀 헷갈리네." 구체 코드 매핑에서 다시 정리 필요.
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
