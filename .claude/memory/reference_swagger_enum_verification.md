---
name: Swagger UI에서 enum 전체 값 확인하는 정확한 방법
description: Example Value 탭은 enum 한 값만 표시해 누락 보임, Schema 탭 또는 raw JSON 직접 확인이 안전
type: reference
originSessionId: e07eb9e6-05bf-4a5d-8f2b-439b1deb33fe
---
## 문제

Swagger UI 기본 화면의 **Example Value 탭**은 필드값을 하나만 보여줍니다. enum 타입 필드의 경우 enum 후보 중 첫 값(보통 알파벳/정의 순)만 보이고 나머지 값들은 숨겨집니다. 그래서 "이 enum이 어떤 값을 받는가?"를 Example만 보고 판단하면 누락됩니다.

**실제 사례 (2026-05-01)**: 댓글 리액션 검증 시 사용자가 `reactionType: "LIKE"` 예시만 보고 다른 값 존재 여부 확인 못함. 실제 enum은 `[LIKE, DISLIKE]` 2종이었음.

## 정확한 확인 방법

### 방법 1: Swagger UI Schema 탭

1. `https://api.melonnetherapists.com/swagger-ui/index.html` 접속
2. 대상 엔드포인트 펼치기
3. Request body 또는 Response 영역에서 `Example Value` / `Schema` 토글 → **`Schema` 클릭**
4. 해당 필드에 마우스 오버 또는 펼치면 `Available values: VAL1, VAL2, VAL3` 줄 표시

### 방법 2: Raw JSON (가장 안전)

1. `https://api.melonnetherapists.com/v3/api-docs` 접속 (JSON 원문)
2. 브라우저 Ctrl+F로 스키마 이름 검색 (예: `ToggleCommentReactionRequest`)
3. 바로 아래 `enum` 키 직접 확인: `"enum": ["LIKE", "DISLIKE"]`

UI 렌더링 누락 가능성을 차단하려면 방법 2가 가장 확실합니다.

## How to apply

- Swagger에서 enum 필드 검증 시 Example만 보고 판단하지 말 것
- 백엔드 스펙 요청/검토 전 enum 범위가 작업의 분기점이 되는 경우 (예: 리액션 종류, 상태 enum) 반드시 raw JSON 확인
- WebFetch로 추출한 결과를 사용자에게 보고할 때도 출처 줄(`enum: [...]`) 원문 인용해 검증 가능하게 제시
