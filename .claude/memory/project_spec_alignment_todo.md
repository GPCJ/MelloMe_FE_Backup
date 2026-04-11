---
name: 스펙 정렬 작업 목록 (04-10 Swagger 기준)
description: 최신 Swagger 스펙과 프론트 코드 불일치 전수조사 결과 — P0~P2 전부 완료 (04-11)
type: project
originSessionId: 10d34c19-4a2c-439b-9267-b37d1d65b635
---
2026-04-10 Swagger 스펙 기준 프론트 코드 정렬 작업 — **04-11 전부 완료**.

## 완료 커밋
- `43b8038` P0: 타입 정렬, fetchPosts fallback, title/ageGroup 제거, HomePage 삭제
- `8b0653d` P1: TherapyArea 라벨 확장, MeResponse 필드 추가, mypage fallback 제거
- `efc2b6a` P2: PostReaction 타입 확장, mock title 제거

## MSW 재정비 (스펙 정렬 연장선)
- `114f08f` handlers.ts 729줄 → 도메인별 9파일 + 데이터 3파일 + state 분리
- `de86708` mock 응답 Swagger 스펙 정렬 (items, postType, visibility, scrapped)
