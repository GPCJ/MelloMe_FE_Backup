---
name: 노션 스킬 정리 2026-04-15
description: 노션 관련 슬래시 커맨드 스킬 구조 개편. /report-notion 신규, 6개 삭제, 2개로 정리.
type: project
---

2026-04-15 노션 스킬 전면 정리 완료.

**Why:** 기존 스킬들이 승인 흐름 없이 직접 노션에 쓰거나, 중복 역할을 하거나, 대상 페이지가 폐기되어 정리 필요.

**How to apply:** 노션 기록이 필요할 땐 `/report-notion` 하나로 해결. 기존 draft가 있을 땐 `/post-notion-draft`.

## 삭제된 스킬 (6개)
- `draft-notion` — 대화 요약 → 메모리 저장만, 노션 작성 없음
- `update-builders` — 승인 없이 TIL에 직접 작성
- `update-til` — update-builders와 동일
- `update-notion` — 대상 페이지(멜로미 프론트엔드 진행 상황) 폐기
- `update-drill` — 코딩 드릴 특화, 직접 업로드
- `draft-til` — report-notion으로 대체

## 현재 노션 스킬 (2개)
- `/report-notion`: 맥락 1줄 → 메모리/git/소스코드 자동 탐색 → 초안 → 승인 → 노션 작성 or 메모리 저장
- `/post-notion-draft`: 메모리의 기존 초안을 노션에 바로 작성 (빌더스 리그 4개 페이지 분류 + 컨벤션 반영)
