---
name: CSV API 검토 진행 상황
description: 멜로미 요구_기능 명세 시트8.csv 38개 항목 검토 및 프론트 연동 현황
type: project
---

파일: `/Users/jin/Downloads/멜로미 요구_기능 명세 - 시트8.csv` (38개 API)

## 검토 완료 (1~26번)

| # | API | 결과 |
|---|-----|------|
| 1 | POST /auth/signup | 수정 완료 |
| 2 | POST /auth/login | 이상 없음 (isNewUser 제거) |
| 3 | POST /auth/refresh | 이상 없음 (인지부채 #008 태깅) |
| 4 | POST /auth/logout | 수정 완료 → 에러 표시 추가 |
| 5 | GET /home | /home 경량화 결정, 백엔드 요청 필요 |
| 6 | GET /me | 이상 없음 |
| 7 | PATCH /me | 이미지 multipart 방식 백엔드 논의 필요 |
| 8 | DELETE /me | **프론트 구현 완료** (탈퇴 버튼 + API + 에러 표시) |
| 9 | GET /me/posts | **페이지네이션 구현 완료** |
| 10 | GET /me/comments | **API 분리 + 페이지네이션 구현 완료** (/me/activity 제거) |
| 11 | GET /me/scraps | **API 분리 + 페이지네이션 구현 완료** (/me/activity 제거) |
| 12 | GET /me/downloads | Post-MVP 보류 |
| 13 | POST /therapist-verifications | 프론트 준비 완료, 백엔드 즉시 승인 대기 |
| 14 | GET /therapist-verifications/me | **구현 완료** (getMyVerification + 인증 상세 UI) |
| 15 | GET /therapist-verifications/me/image | 보류 (이미지 표시 UI 없음) |
| 16-19 | 관리자 API | 스킵 (백엔드 미개발) |
| 20 | GET /posts | **수정 완료** (BoardType→PostType, keyword/postType 추가, 서버사이드 검색 전환) |
| 21 | POST /posts | 보류 — title/ageGroup 400 에러, 백엔드 수정 대기 |
| 22 | GET /posts/{postId} | 이상 없음 (Swagger 스펙 대조 완료) |
| 23 | PATCH /posts/{postId} | 보류 — 21번과 동일한 title/ageGroup required 문제 |
| 24 | DELETE /posts/{postId} | 이상 없음 |
| 25 | GET /posts/{postId}/reaction | 이상 없음 (Swagger 스펙 대조 완료) |
| 26 | PUT /posts/{postId}/reaction | 이상 없음 (낙관적 업데이트 방식, 응답값 미사용은 개선 가능) |

## 주요 변경사항 (이전 세션)

### 에러 처리 개선
- .catch(() => {}) 에러 삼키기 → try/catch + alert 에러 표시로 전환 (LandingPage, Layout, ProfilePage)

### 마이페이지 3탭 재구현
- fetchMyActivity() 단일 API → fetchMyComments() + fetchMyScraps() 분리
- 3탭 모두 독립 페이지네이션 적용
- MyActivity 타입 제거

### 검색 로직 전환
- 클라이언트 사이드 필터링(includes) → 서버 사이드 검색(keyword 파라미터)

### 치료사 인증 관심사 분리
- TherapistVerificationPage: getMe() → getMyVerification() 교체
- PENDING/REJECTED 상태 시 신청일, 거절 사유, 심사일 표시 UI 추가

## 역량 어필 포인트 (노션 작성용)

1. **관심사 분리 설계**: /home vs /me 역할 분리 직접 제안 — 불필요한 데이터 수신 감소 + 확장성 확보
2. **API 효율화**: 프로필 이미지 업로드를 별도 엔드포인트 대신 PATCH /me multipart로 통합 제안 — 불필요한 API 왕복 제거
3. **에러 처리 QA 관점**: 에러 삼키기 패턴을 UX/QA 관점에서 직접 발견하고 전체 코드베이스 수정 지시
4. **서버 사이드 검색 전환**: 클라이언트 필터링의 한계를 인지하고 서버 위임으로 전환
5. **API 스펙 검증**: Swagger와 프론트 코드를 대조하며 postType 불일치 직접 발견

## 다음 재개 지점
- **27번: GET /posts/{postId}/scrap** 부터

**Why:** 항목별 그때그때 수정 방식으로 진행 중. Swagger 스펙 대조 기준으로 전환.

**How to apply:** 다음 세션 시작 시 이 파일 참고해서 27번부터 재개.
