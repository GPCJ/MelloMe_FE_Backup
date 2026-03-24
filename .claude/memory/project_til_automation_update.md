---
name: TIL 자동화 업데이트 (2026-03-24)
description: TIL 양식 및 자동화 업데이트 내용. 포트폴리오 어필 포인트 섹션 추가, /update-builders 커맨드 추가.
type: project
---

2026-03-24 TIL 자동화 업데이트 완료.

**Why:** 빌더스 리그 페이지 운영 시작 — 매일 작업 내용을 포트폴리오 관점에서도 기록하기 위해

## 변경 내용

### TIL 양식 업데이트
기존 양식(배운 것 / 계기 / 핵심 정리 / 다음에 써먹을 곳)에서 아래로 변경:
```
## YYYY-MM-DD — 제목
**분류**: React / TypeScript / 인프라 / 보안 / AI활용 / 기타
### 오늘 한 것
### 배운 것 / 인사이트
### 포트폴리오 어필 포인트 (있을 경우만)
```

### 스케줄러 업데이트
- Trigger ID: trig_01AhUdgHMLPiEwTuYBRgtExv (기존 18:30 KST 유지)
- 새 프롬프트: git log + memory 기반으로 "오늘 한 것 + 포트폴리오 어필 포인트" 포함

### /update-builders 슬래시 커맨드 추가
- 파일: `.claude/commands/update-builders.md`
- 용도: 작업 위주였던 날 수동 실행 (초안 확인 후 업로드)
- `/update-til`과 구분: update-til은 학습/개념 위주, update-builders는 작업/성과 위주

**How to apply:** TIL 관련 작업 시 두 커맨드 모두 인지할 것. 자동화는 18:30 KST 하나로 통합.
