---
name: /privacy 라우트 설계 결정
description: 개인정보처리방침 페이지 라우팅·링크 동작·배너 정책 결정 기록. 진행 상황은 backlog P 섹션 참조
type: project
originSessionId: b38fad9d-2cf7-4029-b779-a2dd2d2da241
---
2026-04-24 `/privacy` 페이지 신설 시 내린 설계 결정들입니다. 진행/완료 상태는 이 파일에 두지 않습니다.

**Why:** GA4/Clarity 쿠키 수집 법적 고지 의무 + 회원가입 동의 체크박스가 실제 문서를 가리켜야 함.

**How to apply:** 이 결정을 건드릴 때(라우팅 변경, 위치 이동, 배너 제거 등) 아래 Why 조항과 모순되지 않는지 확인. 진행 상황·체크박스·완료 여부는 `backlog.md`의 P 섹션 참조.

## 주요 결정

- **라우트**: `/privacy` (Layout 밖 독립 렌더). LandingPage와 같은 계층. 법적 문서 성격이라 Layout의 네비게이션·로그인 UI 불필요하고, 비로그인/로그인 모두 접근 가능해야 해서 GuestRoute/AuthRoute 둘 다 밖.
- **링크 동작 — 일관성보다 맥락**:
  - SignupPage: `<a target="_blank">` 새 탭. 체크박스/이메일 입력 소실 방지 우선.
  - LoginPage: `<button onClick={navigate}>` same-tab. 입력값 소실 리스크 낮음(짧은 폼).
- **초안 고지 배너**: 상단 노란 배너로 "본 문서는 검토 중인 초안입니다" 명시. **PM/운영자 법적 검토 완료 전엔 제거 금지**.
- **보호책임자 연락처**: `melonnebuilders@gmail.com` 플레이스홀더. 정식 책임자 확정 후 교체.
- **이용약관(`/terms`)은 별도 작업**: 이번 스코프 제외. SignupPage/LoginPage 이용약관 링크는 미연결 상태 유지.

## Sunset 트리거

**PM 법적 검토 완료 시점**에 이 메모리를 다음 중 하나로 전환합니다.
- 배너 제거 + 시행일 갱신 후, 이 파일은 "배너 제거 사유/시행일 기록"으로 축소
- 또는 삭제 (메모리 수명 종료)

## 참고

- 본문 10개 섹션 구조·위탁 업체 표(Google/Microsoft/Vercel/AWS)는 `frontend/src/pages/PrivacyPage.tsx` 참조
- 진행 상황(완료·미완료·확인일)은 `backlog.md`의 **P 섹션** + **PM / 운영 섹션**
