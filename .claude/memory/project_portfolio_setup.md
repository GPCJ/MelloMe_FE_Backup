---
name: 포트폴리오 프로젝트 세팅 완료
description: ~/portfolio 디렉토리 생성 및 포트폴리오 전용 메모리 구조 세팅 완료 (2026-03-27)
type: project
---

`~/portfolio` 디렉토리 생성 및 포트폴리오 전용 Claude Code 메모리 세팅 완료 (2026-03-27).

## 구조

```
~/portfolio/                                          ← 포트폴리오 작업 디렉토리
~/.claude/projects/-home-jin24-portfolio/memory/
├── MEMORY.md         ← 메모리 인덱스
├── mellome.md        ← 멜로미 프로젝트 포트폴리오 소스 (my-project 메모리 기반 추출)
└── personal_stack.md ← 개인 기술 스택 + 포트폴리오 사이트 기술 선택 (Next.js)
```

## 운영 방법

- `portfolio` alias로 세션 진입 → 메모리 자동 로드
- 첫 메시지: `mellome.md, personal_stack.md 참고해서 작업 시작하자`
- my-project에서 포트폴리오 어필 포인트 생기면 → `mellome.md` 해당 섹션에 직접 추가

**Why:** my-project 컨텍스트 오염 방지 — 포트폴리오 개발 논의를 완전히 분리된 세션에서 진행.
**How to apply:** 포트폴리오 관련 작업은 항상 portfolio 세션에서 진행할 것.
