---
name: MSW 기반 선구현 계획
description: 백엔드 API 완성 전 MSW mock으로 프론트 기능 구현+안정화 후 연결하는 전략
type: project
---

MSW 기반 선구현 계획 수립 (2026-03-31)

**Why:** 백엔드 대기 항목이 많아 프론트 진행이 막힘. MSW로 미리 구현해두면 API 완성 시 핸들러만 제거하고 바로 연결 가능.

**How to apply:** 아래 항목 구현 시 MSW 핸들러 추가 → 프론트 기능 완성 → 백엔드 연결 시 핸들러 제거

## MSW 선구현 대상 (6개)
- **FNC-022** 닉네임 수정 — `PATCH /me` mock
- **FNC-031** 피드 검색 — `GET /posts?search=` mock
- **FNC-033/034** 파일 업로드 — `POST /posts` multipart mock + 첨부파일 URL 응답
- **FNC-035** 태그 입력 — `POST /posts` body에 tags 추가 mock
- **FNC-039** 게시글 스크랩 — `scrapPost`/`unscrapPost` API 함수 이미 있음, MSW 핸들러만 추가

## MSW로도 불가
- **FNC-025** 치료영역 배지 — 백엔드가 therapyAreas를 저장하지 않기로 한 상태. 스키마 변경 합의 먼저 필요.
