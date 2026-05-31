---
name: post-mvp-mvp-2026-05-15
description: "MVP는 2026-05-15 발표로 종료, 현재 Post-MVP 기능 확장 단계"
metadata: 
  node_type: memory
  type: project
  originSessionId: 441d03d6-0d7f-438e-9654-eaf4b835590a
---

MVP는 **2026-05-15 발표로 완료**. 현재는 **Post-MVP** 단계 — 핵심 가설은 검증됐고, 사용자 정착을 위한 기능 확장기(쪽지, 팔로우, 타인 프로필 등). "단계론상 PMF 구간"이지만 호칭은 **Post-MVP**로 통일(사용자 지정, 2026-05-26). CLAUDE.md "현재 개발 단계"도 Post-MVP로 갱신함.

**Why:** MVP 데드라인(발표 전 안정화 최우선, blast radius 회피)이라는 과거 제약이 더 이상 적용되지 않음. 이 메모리는 원래 "MVP D-day 안정화 우선" 규칙이었으나, 발표 종료로 그 제약은 해제됨.

**How to apply:**
- "발표 전까지 필요한가?" 식 MVP 데드라인 판단 기준은 폐기. 이제 신규 기능 개발이 정상 트랙.
- 단, blast radius 큰 의존성 메이저 업/대규모 리팩토링 회피 기조 자체는 [[feedback_dependency_blast_radius]] 등 별도 규칙으로 유지(MVP 데드라인과 무관한 일반 원칙).
- 신규 기능 착수 시 백엔드 API 선행 여부 확인 후 진행(쪽지=API ready, 팔로우/타인프로필=API 부재).
