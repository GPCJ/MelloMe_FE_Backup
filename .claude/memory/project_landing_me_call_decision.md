---
name: 랜딩 페이지 /me 호출 정책
description: LandingPage에서 GET /me를 매번 호출하는 이유와 React Query 전환 계획
type: project
---

MVP에서는 랜딩 페이지 진입 시 tokens가 있으면 항상 `GET /me` 호출 → 서버 최신 인증 상태 반영.

**Why:** Zustand persist로 user/tokens가 항상 같이 저장/복원되므로 `tokens && !user`는 dead code. 조건부 호출 시 관리자가 인증 승인해도 클라이언트가 stale 상태를 보여주는 문제 발생.

**How to apply:** `/me` 최적화는 React Query 도입 시 staleTime 캐싱으로 해결. MVP 단계에서는 매번 호출 유지.
