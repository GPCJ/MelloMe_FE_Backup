---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /post-notion-draft로 업로드 가능.
type: draft
updated: 2026-06-15
originSessionId: current
---

> ⚠️ **노션 업로드 시 확인 사항**
> - 트러블슈팅 번호는 노션 페이지 직접 확인 후 실제 마지막 번호 +1부터 부여.
> - 페이지 ID:
>   - TIL: `323c8200749b80c2bbe6caf194055593`
>   - 🔧 트러블슈팅: `322c8200749b81f39f71f9c8a4d6eb44`
>   - 🏗 설계 결정: `32dc8200749b81e899bde7aea0a37937`
>   - 📈 성과 & 지표: `32dc8200749b8157b695e5e84e60e01b`
> - 각 `##` 섹션 = 노션 서브페이지 1개. 분류(설계 결정 / 트러블슈팅 / TIL)는 섹션 머리에 표기.
> - **작성 후 이 파일은 비울 것** (헤더만 남기고 ## 섹션 제거). 누적 시 다음 보고 때 stale 충돌 재발 (05-31·06-15 사고).

<!-- 업로드 대기 초안 없음. 새 초안은 이 줄 아래에 ## 섹션으로 추가. -->

## [TIL] 2026-06-15 — Capacitor 앱의 origin(`capacitor://localhost` vs `https://localhost`)과 CORS가 필요한 이유

> 분류: TIL
> 맥락: 웹앱(React)을 Capacitor로 모바일 앱화하는 작업(C2)을 앞두고, "왜 백엔드에 `capacitor://localhost`와 `https://localhost` 두 origin의 CORS 허용을 요청해야 하는가"를 파고들며 origin 개념을 재정리했습니다.

### 오늘 한 것

- Capacitor 모바일 앱이 화면(HTML)을 띄우는 방식과, 그 안의 JS가 백엔드(`https://api.melonnetherapists.com`)와 통신하는 방식을 **출처(origin)와 통신 대상으로 분리**해서 이해했습니다.
- iOS·Android의 기본 origin이 다른 이유와, 그 때문에 백엔드 CORS 허용 목록에 **두 origin을 모두** 넣어야 하는 이유를 정리했습니다.

### 배운 것 / 인사이트

**1. origin = "이 문서가 어디서 왔나"라는 신분증 (통신 능력과 무관)**

- origin은 `프로토콜 + host + 포트` 세 개 묶음입니다. (`https://www.naver.com` → 포트 443 생략)
- origin이 하는 일은 두 가지뿐: ① localStorage·쿠키를 **origin별로 칸 나눠 저장**, ② 요청 보낼 때 "나 어디 소속"이라는 **신분 도장**을 자동으로 붙임.
- origin이 `capacitor://`라고 해서 http 통신을 못 하는 게 아닙니다. **실행자(JS의 `fetch`)와 신분(origin)은 별개**입니다.

**2. Capacitor는 로컬 HTML에 "가짜 주소"를 발급한다**

- 일반 웹: 브라우저가 네트워크로 서버에서 HTML을 받아오고, 그 주소가 origin이 됨.
- Capacitor 앱: HTML·JS가 **이미 폰 안에 번들**돼 있고, **네이티브 핸들러가 로컬 파일을 가로채서** WebView에 먹여줌 (네트워크 X).
- 문제: 로컬 파일(`file://`)은 제대로 된 origin이 없어 localStorage·쿠키·secure context가 깨짐.
- 해결: Capacitor가 **커스텀 스킴 origin**을 발급해 정상 웹사이트처럼 동작시킴.

**3. 스킴(scheme) = URL의 `://` 앞부분, "무엇으로 처리할지"의 라벨**

- `https://`=네트워크 통신, `file://`=로컬 파일, `capacitor://`=Capacitor 네이티브 핸들러에 위임.
- `capacitor://`는 http를 변장시킨 게 **아니라** 진짜로 네트워크가 아닌 별개 스킴.

**4. iOS와 Android의 기본 origin이 다르다 (동작은 동일)**

| | 화면(HTML) 출처 = origin | 실제 네트워크 |
|---|---|---|
| iOS | `capacitor://localhost` (로컬) | JS의 `https://api...`만 |
| Android | `https://localhost` (로컬, **이름만 https**) | JS의 `https://api...`만 |

- 차이는 **출처 이름표(origin)뿐**이고, "로컬에서 HTML 꺼냄 + JS는 `https://api...`로 통신"하는 구조는 동일.
- ⚠️ 함정: Android의 `https://localhost`는 이름만 https일 뿐 **여전히 로컬 파일을 꺼내오는 것**(네트워크 아님). 진짜 네트워크는 양쪽 모두 JS가 `https://api.melonnetherapists.com`을 호출할 때만 발생.

**5. 그래서 CORS 허용이 왜 두 개냐**

- 앱이 API를 호출하면 요청에 **앱의 origin 도장**이 찍힘 — iOS는 `capacitor://localhost`, Android는 `https://localhost`.
- 서버(`https://api.melonnetherapists.com`)는 자기와 **다른 origin**(cross-origin)이라, 응답 헤더 `Access-Control-Allow-Origin`에 **저 두 origin을 모두 허용**해야 받아줌.
- 핵심: **"같은 앱인데 OS별로 신분증 이름이 둘"** → 그래서 둘 다 허용 목록에 필요.

**6. 웹앱 대비 모바일 앱이 바꾸는 건 딱 하나**

- 웹앱: HTML도 네트워크(`https://www.melonnetherapists.com`/CDN)로 받고 + JS도 `https://api...`로 통신 → 둘 다 네트워크.
- 모바일: **HTML만 로컬(`capacitor://`/`https://localhost`)로 바뀌고**, JS 통신 로직은 그대로.
- → 코드 재사용률이 높은 이유(기존앱 ~90% 재사용)가 이 구조 덕분.

### 포트폴리오 어필 포인트

- "왜 동작하는가"를 표면에서 멈추지 않고 **origin = scheme+host+port라는 정의**까지 내려가 cross-origin 발생 지점을 정확히 짚음.
- 모바일 앱화(Capacitor) 시 백엔드에 **무엇을(두 origin) 왜(OS별 기본 스킴 차이) 허용해야 하는지** 근거를 갖고 요청할 수 있음 — FE/BE 협업에서 모호한 "CORS 열어주세요"가 아니라 정확한 스펙 전달.
- `https://localhost`(Android)가 "이름만 https일 뿐 로컬"이라는 흔한 함정을 구분 — 표면 명칭이 아니라 동작으로 이해.
