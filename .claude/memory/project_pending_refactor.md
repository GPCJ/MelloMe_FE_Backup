---
name: 보류된 리팩토링 항목
description: 코드 점검 중 발견했지만 나중에 처리하기로 한 기술부채 목록
type: project
---

## 보안 확인 항목 (백엔드 논의 필요)

### accessToken localStorage 저장 보안 검토 (2026-03-29)
- **현황**: `useAuthStore`의 `persist` 미들웨어가 accessToken을 localStorage에 평문 저장
- **위험**: XSS 공격 시 토큰 탈취 가능
- **완화 요소**: DOMPurify 적용(XSS 주요 경로 차단), Refresh Token은 httpOnly Cookie, Access Token 만료 시간이 짧으면 피해 범위 제한
- **현황**: 백엔드에서 15분 근처로 설정 예정 (2026-03-29 확인) → 현재 구조로 충분
- **How to apply:** 배포 전 백엔드에 정확한 만료 시간 확인 후 이슈 없으면 닫기

### canAccessCommunity 백엔드 이중 검증 확인 (2026-03-29)
- **현황**: `ProtectedRoute`의 `canAccessCommunity` 체크는 클라이언트 사이드 UX용
- **확인 필요**: 백엔드 API에서도 동일하게 인증된 치료사만 접근 가능하도록 검증하는지
- **How to apply:** 백엔드 코드 리뷰 시 확인

## 보류 항목

### AbortController 적용 (2026-03-29)
- **위치**: `PostListPage.tsx`, `PostDetailPage.tsx` 의 useEffect 내 fetch 호출
- **문제**: 컴포넌트 언마운트 후 fetch 완료 시 setState 호출 → 잠재적 메모리 누수, stale 데이터
- **해결책**: useEffect cleanup에서 `controller.abort()` 호출
- **Why:** MVP 단계에서 당장 체감 문제는 없으나 빠른 네비게이션 시 콘솔 에러 가능
- **How to apply:** 기능 안정화 후 일괄 적용

### refresh plain axios 교체 (2026-03-29)
- **위치**: `frontend/src/api/axiosInstance.ts`
- **문제**: refresh 요청도 axiosInstance 사용 → refresh가 401 반환 시 interceptor가 재시도해 2번 호출됨
- **해결책**: `import axios from 'axios'`로 plain axios 사용해서 refresh 경로 분리
- **Why:** 현재 기능상 문제는 없으나 의도하지 않은 이중 호출 가능성 존재. 백엔드 연결 후 실제 토큰 갱신 시 확인 필요.
- **How to apply:** 백엔드 연결 후 401 인터셉터 통합 테스트 시점에 같이 처리
