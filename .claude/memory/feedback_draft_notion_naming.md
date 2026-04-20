---
name: 슬래시 커맨드 네이밍 — 범용 목적엔 범용 이름
description: 커맨드 이름이 특정 용도를 암시하면 혼란 — 노션 초안 워크플로우 확립
type: feedback
---

슬래시 커맨드 이름이 특정 용도를 암시하면(`/draft-til`) 범용으로 쓰기 꺼려진다. 범용 목적이면 범용 이름(`/draft-notion`) 사용.

**Why:** `/draft-til`에 노션 진행상황 초안을 저장하려니 "TIL 아닌데?" 느낌이 들어서 별도 커맨드 요청.

**How to apply:**
- 새 커맨드 만들 때 이름이 실제 용도 범위와 일치하는지 확인
- 노션 초안 워크플로우: `/draft-notion` → `/push-mello` → 다른 기기에서 `/pull-mello` → `notion_draft.md` 확인 → 노션 업로드
