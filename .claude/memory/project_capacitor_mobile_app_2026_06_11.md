---
name: project_capacitor_mobile_app_2026_06_11
description: 모바일 앱 확장 = Capacitor 확정 + C1 스캐폴딩 완료(PR
metadata: 
  node_type: memory
  type: project
  originSessionId: 1f7daa41-4d30-4445-be00-95aa16cbc6ee
---

# 모바일 앱 확장 — Capacitor 확정 + C1 완료 (2026-06-11)

2026-03-26 ADR의 "부분 확정"(PWA vs Capacitor)을 Post-MVP 시점에 **Capacitor로 확정**. wiki `adr-pwa-vs-capacitor-2026-03-26`의 후속.

## 결정 근거 (재논의 결과)
- 타겟(20~30대 여성·아이폰 다수) 모바일 접근성 개선이 동기.
- **Flutter 제외**: 배우고 싶으나 1개월 마감 내 손코딩 불가 + AI 100% 생성은 리뷰 불가(인지부채 최대, 본인 원칙 위배). → 제출 후 개인 학습 트랙으로 분리.
- **React Native 제외**: 기존 UI 0% 재사용, FE 1명 감당 불가(ADR 유지).
- **PWA 제외**: 앱스토어 불가.
- 백엔드 변경량은 Flutter≈Capacitor (인증 쿠키·OAuth·푸시), 오히려 Capacitor가 WebView 덕에 쿠키 인증 덜 건드림. 비용 차이의 핵심은 FE(재작성 vs 감싸기).

## 결정 확정 (2026-06-12)
- **appId=`com.mellti.app` 최종 확정** — 스토어 첫 제출 후 영구 고정 동의.
- **푸시 알림 v1 포함 확정 → ~4주 풀 로드맵** 채택(2주 단축안 폐기). iOS 4.2 리젝 회피 명분 + 리텐션 도달채널 갭 동시 해소. 푸시 BE 의존(FCM/APNs+토큰저장·발송)이 critical path에 들어옴.

## C1 완료 (PR #27, 브랜치 `feat/capacitor-setup`, 커밋 `d2f94ed`)
- `@capacitor/core·cli·ios·android` 도입, `npx cap init/add/sync` 완료.
- `capacitor.config.ts`: **appId=`com.mellti.app`**(스토어 첫 제출 후 변경 불가), appName=`Mellti`, webDir=`dist`.
- `android/`·`ios/` 네이티브 프로젝트 커밋(아이콘·권한·푸시 영속화용). 최신 Capacitor=iOS가 **SPM**(CocoaPods 아님)이라 WSL에서 pod install 없이 스캐폴딩 성공.
- **AI 작성 로직 0** — 전부 CLI 스캐폴딩 → 인지부채 박제 불필요. unlock 갱신했으나 C1엔 불필요했음.
- F-15 미커밋 작업(`PostListPage.tsx`,`feedScrollStore.ts`)은 PR에서 제외(분리 유지).

## 환경 분리
- **C1(스캐폴딩)=WSL 가능**, **C2(기기 실행)=맥북 필요**(Xcode=macOS 전용, WSL 불가). 사용자=맥북+삼성폰 보유.
- 빌드에 박힌 API URL=`.env.local`의 `api-staging.melonnetherapists.com`(HTTPS, 기기 접근 OK).

## 후속 의존성 (C2+, 아직 안 함) — PR #27 본문에 표로 박제
- **CORS**[BE]: WebView origin(`capacitor://localhost`,`https://localhost`) 허용 추가해야 API 성공.
- **쿠키 인증**[FE+BE]: httpOnly RT 쿠키의 네이티브 cross-origin SameSite 검증, 안 되면 "네이티브엔 RT body" 옵션.
- **푸시**[FE+BE]: FCM/APNs + BE 토큰저장·발송. iOS 4.2(minimum functionality) 리젝 회피 핵심 명분. SSE→네이티브 푸시 전환은 리텐션 도달채널 갭과도 맞물림([[project_retention_strategy_reach_channels_2026_06_11]]).
- 아이콘·스플래시: 소스 이미지 필요.

## 4주 로드맵 분기점
푸시 v1 포함=~4주 풀 / 제외=~2주(iOS 4.2 리젝 위험↑, Android 무관). 1주차 C2+CORS, 2주차 푸시(분기 확정), 3주차 내부테스트(Play 내부트랙·TestFlight), 4주차 iOS 정식제출+심사버퍼.

## C1 머지 완료 (2026-06-15)
- **PR #27 develop 머지 완료**(머지 커밋, MERGED). 리뷰 표면=`capacitor.config.ts`+`package.json` ~13줄뿐, 나머지 75파일은 전부 `cap add android/ios`가 찍은 CLI 스캐폴딩(AI 작성 로직 0)이라 셀프리뷰만으로 머지 정당. 사용자 직접 파일 훑음.
- **C2 플로우 변경**: 스캐폴딩이 develop에 있으므로 맥북에서 feat 브랜치가 아니라 **`develop` checkout**. 원격 `feat/capacitor-setup`은 F-15 미커밋이 로컬 동명 브랜치에 얹혀 있어 미삭제 보류.
- WSL 사전준비 검증(06-15): `npm run build` exit 0(prerender 3p)·`cap sync` OK(iOS=SPM)·빌드 박힌 API=`https://api-staging.melonnetherapists.com`(HTTPS, localhost 없음→기기접근 OK).

## C2 완료 (2026-06-15)
- **맥북에서 iPhone 17 시뮬레이터(iOS 26.5) Mellti 앱 실행 확인** — 홈화면에 앱 아이콘 설치됨.
- 맥북 환경: Xcode 26.5 설치 완료, iOS 26.5 시뮬레이터 런타임 다운로드 완료(8.52GB).
- 로그인 시도 → "로그인 실패" = **예상된 CORS 블로킹** 확인.
- **MEL-56 등록** — `capacitor://localhost`(iOS), `http://localhost`(Android) 허용 요청. 영구 설정 필요(스토어 배포 후에도 동일 origin 사용).
- 쿠키 인증(RT httpOnly) 이슈 = CORS 해결 후 실제 로그인해봐야 확인 가능. 문제 시 "네이티브엔 RT body" 추가 BE 작업.

## v2 결정 사항
- **치료사 면허번호 카메라 자동입력(OCR)** = 정식 배포 후 v2로 결정. 초기 범위 제외. 기술 스택: `@capacitor/camera` + Google ML Kit(한국어 OCR, BE 엔드포인트 처리 권장).

## 현재 상태 (2026-06-15 갱신)
- **MEL-56 BE 완료(PR #126), staging 검증 ✅, prod 미배포 ❌**
  - staging(`api-staging.melonnetherapists.com`): `capacitor://localhost` preflight → 200, `Access-Control-Allow-Origin: capacitor://localhost` + `Allow-Credentials: true` 확인.
  - prod(`api.melonnetherapists.com`): 403 "Invalid CORS request" — PR #126 아직 prod 배포 전.
  - prod 배포 완료 후 앱에서 로그인 검증 → MEL-56 종료 가능.
- **⚠️ Android origin 미검증** — BE가 `http://localhost`로 설정했으나 실제 Capacitor 8.4 Android origin=`https://localhost`(line 65). prod 배포 후 Android 기기/에뮬레이터 검증 필수. iOS는 staging ✅로 확인됨.
- prod 배포 후 순서: `npx cap run ios` → 로그인 테스트 → 쿠키 인증(RT httpOnly) 확인 → Android origin 정정 필요 시 BE 추가 요청.

## 브랜치 정리 + MEL-56 티켓 오류 발견 (2026-06-15 후속 세션)
- **`feat/capacitor-setup` 브랜치 삭제 완료**(line 47 "미삭제 보류" 해소). 브랜치에만 있던 비-capacitor 작업 2건(R-12 리액션캐시 any제거, F-15① 팔로우탭 스크롤복원)을 develop으로 cherry-pick→tsc 통과→push(`492f674`). patch 동일성(`git cherry`) 확인 후 로컬+원격 브랜치 삭제. **C2는 계속 develop 기준**(변동 없음).
- **⚠️ MEL-56 Android origin 오류**: 티켓·line 54는 Android를 `http://localhost`로 요청했으나, **Capacitor 6+ `androidScheme` 기본값=`https`**(공식 문서 확인). 본 앱=Capacitor `8.4.0` + `capacitor.config.ts`에 scheme 미명시 → **실제 Android origin=`https://localhost`**. BE가 `http://localhost`로 CORS 설정하면 **Android 로그인 실패**(앱은 https origin 전송→차단). 지금까지 iOS 시뮬만 테스트해 미발현. **BE에 `https://localhost`로 정정 요청 필요**. iOS `capacitor://localhost`는 정확.
- 참고 정리(BE 핸드오프용): origin=scheme+host+port. iOS=`capacitor://localhost`, Android=`https://localhost`(둘 다 로컬 HTML 출처, 이름만 다름). 실제 네트워크는 양쪽 다 JS가 `https://api.melonnetherapists.com` 호출 시만. → 개념 학습 Notion TIL 초안(`notion_draft.md`)으로 박제.

## 재개 트리거 「Capacitor 이어가자」 또는 「모바일 앱 이어가자」
- CORS 해결 후: `npx cap run ios` → 로그인 테스트 → 쿠키 인증 확인.
- C2 환경 이미 세팅됨(맥북에 Xcode 26.5 + iOS 26.5 런타임). 재실행 시 `cd frontend && npm run build && npx cap sync && npx cap run ios`만 하면 됨.
