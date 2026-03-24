---
name: CORS OPTIONS 403 에러 재발 (2026-03-24)
description: CORS 완료 이후 OPTIONS preflight 403 에러 재발, 백엔드 수정 요청 완료 대기 중
type: project
---

OPTIONS preflight 요청이 403으로 차단되는 CORS 에러 재발.

**Why:** Spring Security가 CORS 필터보다 먼저 실행되면서 인증 없는 OPTIONS 요청을 차단함

**에러 메시지:**
`Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present`

**원인:** Spring Security 설정에서 OPTIONS 메서드를 permitAll() 처리 안 함

**요청 내용:** SecurityConfig에서 `requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` 추가 요청

**현재 상태 (2026-03-24):** 백엔드에 수정 요청 완료, 반영 대기 중

**How to apply:** 백엔드 수정 완료 알림 받으면 로그인 테스트 재시도할 것
