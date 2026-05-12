---
name: api
description: "에러 삼키지 말기 + 원인별 분기 (401은 인터셉터, 500/네트워크는 무시)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5b68a5d7-0991-477b-8442-2fad7e6c321a
---

API 에러 처리 합의 규칙 모음입니다.

---

## 1. 에러 삼키지 말고 사용자에게 실패 표시

`.catch(() => {})`로 에러 무시하지 말 것. 실패 시 사용자에게 알려야 합니다.

**Why:** MVP QA 단계에서 에러가 보이지 않으면 문제 발견 불가. jin24님이 직접 UX 관점에서 지적.

**How to apply:** API 호출 실패 시 alert 또는 UI로 에러 표시. 문구는 "실패했습니다. 다시 시도해주세요. (네트워크 탭 참조)" 처럼 개발자 친화적 + 비개발자도 문제 인지 가능한 수준.

---

## 2. 원인별 분기 — 무조건 clearAuth() 금지

API 실패 시 무조건 `clearAuth()`로 로그아웃 처리하지 말 것. 에러 원인별 적절한 처리가 다릅니다.

- **401** → axios 인터셉터가 refresh 시도 후 실패하면 알아서 `clearAuth()` 호출
- **500 (서버 에러)** → 토큰은 유효. 로그아웃시키면 안 됨
- **네트워크 끊김** → 같은 이유. 와이파이 잠깐 끊긴 건데 로그아웃되면 안 됨

**Why:** 유저가 직접 "clearAuth() 할 필요가 없는 케이스 없어?"라고 지적. 모든 실패를 동일 처리하는 건 과잉 방어.

**How to apply:** catch 블록에서 `clearAuth()` 쓰기 전에 "이 에러가 정말 인증 무효를 의미하는가?" 확인. 401은 이미 인터셉터가 처리하므로 대부분의 페이지 레벨 catch에서는 `.catch(() => {})` 또는 UI 에러 표시가 적절.

---

## 연관
- [[feedback_backend_blame]] — 서버 에러 시 프론트 먼저 의심
- [[project_profile_edit_cleanup]] — `getAxiosErrorMessage` 유틸 도입 사례
