---
name: workaround 추가 전 현재 스펙/상태 재확인 필수
description: 증상 회피 코드(가드/catch 흡수/강제 필드 전달) 추가 전에 반드시 현재 시점의 백엔드 스펙·실제 에러를 재확인. 과거 에러 로그/메모리만 믿고 회피 코드 추가 금지
type: feedback
originSessionId: 79177490-8dd7-4c29-95f8-1d5c1fee116d
---
증상 회피 코드(가드 / catch 흡수 / 강제 필드 전달 / defensive default 등)를 추가하기 전에 반드시 **현재 시점**의 실제 원인을 재확인할 것.

**Why:** 2026-04-20 PATCH /me 400 에러를 보고, 원인을 "profileImageUrl 필수"로 추정한 뒤 그 필드를 강제 전달하는 workaround(T1/T2)를 추가했음. 그리고 그로 인해 레이스 조건이 발생해 가드 3곳을 더 덧붙임. 그런데 2026-04-21 Swagger 재조회 결과 PATCH /me 요청 바디에는 profileImageUrl이 아예 없었음 — 즉 언젠가 백엔드 스펙이 바뀌었는데 그 사실을 모른 채 어제 workaround를 쌓았을 가능성이 큼. 사용자 교훈: "AI 도움 없이 직접 코딩했다면 400 보고 곧장 Swagger/네트워크 탭으로 원인 검증부터 했을 것."

**How to apply:**

1. 400/401/500 등 상태 에러를 보거나, "원인 모르니 일단 감싸자"는 판단이 들면 → **즉시 멈춤**

2. 먼저 아래 중 하나로 현재 스펙/상태를 확인:
   - 백엔드: `WebFetch https://api.melonnetherapists.com/v3/api-docs` 로 Swagger 재조회
   - 프론트: 네트워크 탭 실 request/response payload, 실제 에러 body
   - 코드: Grep/Read로 현재 구현 직접 확인 (메모리·과거 커밋 의존 금지)

3. 확인된 근본 원인이 있을 때만 수정 경로 제안. 모르면 "모르겠다, X 확인이 필요합니다"라고 말하고 사용자에게 다음 단계 묻기

4. 특히 이미 저장된 메모리(T1/T2 같은 임시 대응 기록)를 보고도 **그 조건이 지금도 유효한지** 재검증할 것. 메모리가 최신 상태라는 보장 없음 — 정책: "저장된 규칙 맹목 적용 금지" (`feedback_verify_rules_root_cause.md`)

5. workaround가 정말 필요하다고 판단되면, 커밋/주석에 **현재 스펙 근거 + 해당 workaround 제거 조건**을 명시해서 미래에 다시 정리할 수 있게 남길 것
