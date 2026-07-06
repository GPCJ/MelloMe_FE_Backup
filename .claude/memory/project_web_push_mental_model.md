---
name: project_web_push_mental_model
description: "Web Push 알림 멘탈 모델 — 모바일 푸시와 동일 구조(서버→푸시서비스 중계→SW가 띄움), 사이트 꺼져도 동작. 사용자 원리 이해 완료(2026-07-02 재진술 검증), 미구현"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3c90712a-6b5d-476b-98ef-365451365b66
---

PC OS 알림으로 멜티 알림을 **사이트가 꺼져 있을 때도** 전달하는 기능. [[project_retention_strategy_reach_channels_2026_06_11]]의 "도달 채널 부재" 갭을 메우는 채널. **2026-06-30 1차 이해 → 2026-07-02 원리 복습 완료(본인이 전체 흐름 스스로 재진술), 구현 미착수.**

## 2026-07-02 복습에서 확정된 이해 (본인 재진술)
- 핵심 골격을 먼저 스스로 잡음: "서버가 직접 안 보내고 **중계서버(FCM) 경유**".
- 채운 빈칸: ① 중계서버=FCM이고 **브라우저가 지정**(BE 선택권 없음, Chrome=FCM) ② 받는 주체=**서비스워커(관리인)**, FCM은 배달만·토스트는 SW가 띄움·클릭 처리도 SW ③ 구독은 **FE(React) 코드**에서 subscribe → FCM이 주소 발급 → 인증(JWT) 실은 등록 API로 BE에 저장 ④ **구독 시점 ≠ 발송 시점**(발송은 나중, BE가 개시, FE 관여 X — 안 그러면 SSE와 다를 게 없음)
- 추가 습득: SSE=연결(탭 닫히면 끊김) vs 구독=영속 등록 / 구독 전 **권한 허용 게이트** 필요(mount 자동 X, 적절한 순간에) / 같은 브라우저·origin=같은 주소 안정적, 예외 시 `pushsubscriptionchange`로 재등록 / 유저당 기기별 다중 주소 → upsert
- **결정: 지금은 구조(원리) 이해까지로 충분. 구체 API(register/subscribe/VAPID/SW 핸들러)는 실제 구현 착수 시 학습.** 스타일상 구조 이미지가 잡히면 흡수된 것([[user_comprehension_criterion]]).

## 핵심 통찰 (사용자 본인이 연결함)
**모바일 푸시 알림과 동일 구조.** 서버가 기기에 직접 안 보내고, 항상 **푸시 서비스(중계소)를 한 번 거쳐** 보냄.

## 비유 (집/관리인/우체국 — [[feedback_react_concept_layered_analogy]] 체계 확장)
- **거주자 = 탭(React 앱)**: 탭 닫으면 앱 코드 전부 죽음
- **관리인 = 서비스워커(Service Worker)**: 탭 죽어도 현관 상주, 초인종 울리면 깨서 윈도우 토스트 띄움
- **우체국 = 브라우저 푸시 서비스**(Chrome은 내부적으로 FCM): 24시간 중계, 브라우저가 백그라운드 상시 연결
- **발신인 = 백엔드**

## 두 장면
1. **구독(1회)**: 권한 허락 → SW가 우체국에서 이 기기 전용 사서함 주소(subscription) 발급 → 백엔드에 등록
2. **발송(매번)**: 백엔드 → 사서함 주소로 편지를 우체국에 맡김 → 우체국이 초인종 → SW가 깨서 윈도우 토스트 → 클릭 시 해당 페이지

## 왜 사이트 꺼져도 되나
알림 띄우는 주체 = **SW + 우체국**(탭과 독립). React 앱이 아님.

## 모바일 푸시 매핑 / 왜 중계가 필요한가
- 우체국 = iOS **APNs** / Android·Chrome **FCM**. Chrome Web Push는 실제로 FCM 인프라 그대로 사용
- 왜 직접 못 쏘나: 기기 주소 수시로 바뀜 + 항상 온라인 아님 + 배터리/연결을 벤더가 관리 → 벤더 우체국이 상시 연결 보유, 서버는 "이 사서함으로 전해줘"만

## SSE와 차이
SSE = 집에 있을 때만(앱 켜짐, 지금 멜티). Push = 외출 중에도. **같은 사건 두 채널** — 서버가 쪽지 발생 시 SSE + Push 둘 다 쏨.

## 구현 단계 (미착수, 추천 = A 하이브리드: 보일러플레이트 AI / 신규로직 본인)
- **Phase 0 BE**: VAPID 키쌍 발급 + `POST/DELETE /push/subscribe` + SSE 쏘는 지점에 web-push 발송 추가
- **Phase 1 FE**(지금 가능): 지원 감지 + 권한 토글 UI + `push-sw.js` + subscribe + 구독 POST. BE는 MSW stub
- **Phase 2 BE**: 실제 발송 연결
- **Phase 3 iOS**: manifest + PWA 홈화면 설치 게이트
- **함정**: ① MSW SW와 루트 스코프 충돌 → 기존 SSE처럼 `VITE_MSW_ENABLED !== 'true'`일 때만 푸시 등록 ② VAPID 공개키는 BE 제공, `VITE_VAPID_PUBLIC_KEY` env 자리
- 윈도우 데스크탑(Chrome/Edge)은 **PWA 설치 없이도** 됨(manifest는 iOS 단계만)
- 현황: 커스텀 SW 없음(`public/`엔 MSW만), manifest 없음. SSE는 `useNotificationSSE.ts`
