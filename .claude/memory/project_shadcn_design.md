---
name: shadcn/ui 도입 배경 및 개발 방침
description: 디자이너가 shadcn 기반 UI를 별도 제작 예정 — 현재는 확장성 중심으로 선개발
type: project
---

디자이너가 shadcn/ui를 활용해 최종 UI를 제작할 예정. 현재 개발은 그 UI가 나오기 전 선행 작업.

**How to apply:**
- 컴포넌트 구조는 shadcn 기반으로 작성하되, 스타일은 CSS 변수 기반으로 분리
- 하드코딩된 색상/크기값 지양 — Tailwind 시멘틱 토큰(`bg-primary`, `text-muted-foreground` 등) 사용
- 코드 작성 전 항상 계획 수립 후 확인 받고 진행

**완료:** LoginPage, SignupPage, Layout, HomePage shadcn 리팩토링 완료 (2026-03-13)
