---
name: 프론트 기능명세 체계 변경
description: 도메인별 순차 작성 방식으로 전환, 새 컬럼 구조 및 파일 규칙
type: project
---

프론트 기능명세 체계 변경 (2026-04-01 주간 회의 결정)

**Why:** 팀 전체가 포지션별로 각자 기능 명세를 작성하되, 도메인 단위로 순차 작성하기로 변경. 한 도메인 완료 후 다음 도메인 진행.

**How to apply:** 기능 구현/명세 논의 시 아래 규칙 적용.

## 변경 사항
- **작성 방식**: 전체 일괄 → 도메인별 순차 작성
- **번호 체계**: FNC-001부터 (프론트 문서 내 독립 번호, 백엔드와 별도)
- **파일 구조**: `docs/feature-spec/{도메인}.md` + `.csv` (Google Sheets 가져오기용)
- **기존 명세**: `docs/feature-spec-frontend.md` 보존, 다음 도메인 넘어갈 때 참조용

## 현재 작성된 도메인
- `docs/feature-spec/auth.md` / `auth.csv` — 인증 + 인증/인가 + 관리자 (FNC-001~009)

## 컬럼 구조 (팀 어느 정도 통일)
기능ID | 기능명 | 진행 상황 | 구현률 | 우선순위 | 릴리즈 | 도메인 | 화면·모듈 | 주요 사용자 | 기능 설명 | 정책·예외

- 왼쪽에 진행 지표(진행 상황/구현률/우선순위/릴리즈) 집중 배치
- 진행 상황: 시작 전 / 진행 중 / 완료
- 구현률: 0~100%
- 릴리즈: MVP / MVP+

## 주요 정책 변경 (인증 도메인)
- 치료사 인증 제출 → 즉시 THERAPIST 권한 부여 + UNDER_REVIEW (사후 검토 방식)
- 인증 상태값: NOT_REQUESTED / UNDER_REVIEW / APPROVED / REJECTED (기존 PENDING 폐기)
- REJECTED 시 role=USER 강등
- 관리자 인증 검토: Post-MVP → P0 MVP 격상
- Google OAuth: 삭제됐다가 MVP+로 부활 (P1)
- 신규 기능: 치료사 인증 입력 임시 저장/복원

## 백엔드 Swagger 스펙
- `docs/openapi-local.json` — EC2 서버(43.203.40.3:8080)에서 저장
- 저장 명령어: `curl -s http://43.203.40.3:8080/v3/api-docs > docs/openapi-local.json`
