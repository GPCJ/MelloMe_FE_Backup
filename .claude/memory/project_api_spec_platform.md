---
name: API 명세 플랫폼 Swagger 통일
description: API 명세를 Swagger UI로 통일, 구글 시트 폐기 결정 (04-05)
type: project
---

API 명세 공유 플랫폼을 **Swagger UI**로 통일 (04-05 확정). 구글 시트 이중관리 폐기.

**Why:** 구글 시트는 코드와 동기화 안 되어 스펙 불일치 빈번. Swagger는 Spring Boot에서 자동 생성되므로 백엔드 추가 부담 거의 없음.
**How to apply:** API 스펙 확인 시 Swagger UI(EC2) 참조. 구글 시트는 더 이상 사용하지 않음.
