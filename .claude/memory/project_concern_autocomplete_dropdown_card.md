---
name: project_concern_autocomplete_dropdown_card
description: "고민 카드 진단명 자동완성 UX 결정 — 드롭다운 카드형(세로) 채택, 고스트 텍스트 폐기"
metadata: 
  node_type: memory
  type: project
  originSessionId: 638eb4f6-0a91-4cb8-ab4f-60b6e9c7bd87
---

고민 카드 작성 시 `DiagnosisTagInput`의 자동완성 표시 방식 결정 (2026-05-28).

**채택**: 드롭다운 카드형(세로). input 아래 흰 배경 컨테이너에 매칭된 진단명 후보를 **카드 스타일 행**으로 위→아래 나열. 클릭하면 태그로 추가, 후보 없으면 자유 입력 + Enter로 자유 태그 추가. 검색 키는 한글 name + aliases(영문/이칭) 둘 다, 추가되는 저장값은 항상 한글 name([[project_concern_card_feature]] 스펙 §3.5와 동일).

**왜 (세션 사고 흐름 박제)**: 사용자가 처음 떠올린 건 Copilot식 인라인 고스트 텍스트(Tab 확정)였음. 다음 두 이유로 폐기 — ① 고스트 텍스트는 "친 글자 + 뒤에 이어붙이기" 구조라 prefix 매칭만 자연스러움. `asd`→자폐스펙트럼장애, `간질`→뇌전증처럼 영문/이칭 substring 매칭이 불가능해 §3.5 alias 검색 기능을 포기해야 함. ② `<input>` 인라인 고스트는 투명+오버레이로 직접 그려야 하고 한글 IME 조합 중 깜빡임/커서 정렬이 토끼굴. 시간 박스 불확실.

대신 동일한 시각적 세련됨을 카드형 행 디자인(흰 배경, 작은 보더/그림자, 패딩 넉넉, hover 강조)으로 보강. 가로 스크롤이 아니라 **세로**(모바일 친화 + 후보 끝까지 보임).

**구현 위치**: `frontend/src/components/post/DiagnosisTagInput.tsx`(Task 6). 로직(필터·중복·max10·100자 가드)은 [[project_concern_card_feature]] 계획 Task 6과 동일 — 시각만 카드형 세로로 렌더.

**A vs B 비용 분석 보존**: 사용자가 "드롭다운 먼저→고스트로 리팩토링 vs 고스트 바로" 비용을 물어본 결과, 태그 인프라(value[] 상태/addTag/removeTag/가드)는 두 패턴 공유라 드롭다운→고스트 전환 시 ~20~30줄만 버려짐. 고스트 raw 비용이 낮지만 IME/오버레이 미지수가 커 프로토타입(스펙 §2 "반응 약하면 폐기") 맥락에선 드롭다운 먼저가 기대비용↓. 이 결정으로 고스트는 영구 폐기, 카드형 드롭다운만 진행.
