---
name: 재시작 후 이어할 작업 (2026-03-20)
description: Figma MCP 연동 후 재시작 전 기록 — 진행 중이던 작업 목록
type: project
---

## 재시작 후 이어할 작업

**Why:** Figma MCP 추가로 Claude Code 재시작 필요. 재시작 전 작업 상태 기록.
**How to apply:** 재시작 후 이 파일 참고해서 작업 이어가기.

---

## 1. 치료사 인증 페이지 + 환영 모달 — **계획 완료, 구현 대기 중**

계획 파일: `/Users/jin/.claude/plans/distributed-frolicking-meteor.md`

### 치료사 인증 페이지 (`/verification`)
- 라우트 신규 추가, ProtectedRoute 안
- 피그마 디자인 확정 (node 269-682)
- 폼: 면허번호(텍스트) + 면허증 파일 업로드 + 치료영역 다중 선택
- API: `POST /therapist-verifications` — `licenseCode` + `licenseImage` 전송
- 치료영역은 **UI만 구현** (API 미지원, 프론트 상태만 관리)

### 환영 모달 (`WelcomeModal.tsx`)
- 조건: `isNewUser: true` 일 때 노출
- 피그마 디자인 확정: 흰색 모달, shadcn Dialog 사용
- 버튼: "홈으로 가기"(검정) + "치료사 인증하러 가기"(보라 outlined, 강조)
- LoginPage의 기존 isNewUser 인라인 UI 교체

### API/Figma 불일치 해결 결정
- `licenseCode`(면허번호 문자열): API 필수 → **폼에 추가**
- 치료영역: Figma에 있음, API 없음 → **UI만 구현**

## 3. 마이페이지 대시보드 간소화 — 팀 논의 결과 대기 중

- stat 카드 6개 → 다운로드/준 반응 제거 후보
- 탭 4개 → 자격인증 탭 제거 후보 + 스타일 변경 후보 (pill 형태)
- 팀원 의견 취합 후 확정 예정

## 4. Figma MCP 연동 완료 (2026-03-20 재설정)

- 이전에 등록됐다고 기록됐으나 실제로 누락돼 있었음
- `~/.claude.json` `/Users/jin/my-project` 섹션에 재추가 완료
- 패키지: `figma-developer-mcp`, `--figma-api-key` 플래그 사용
- Claude Code 재시작 후 활성화
- 피그마 파일 URL 붙여넣으면 직접 읽기 가능 (권한 있는 파일만)

## 5. shadcn Select 컴포넌트

- 이번 세션에서 `npx shadcn add select`로 설치 완료
- 치료영역 선택에 사용 예정
