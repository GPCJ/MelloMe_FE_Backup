---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /post-notion-draft로 업로드 가능.
type: draft
updated: 2026-04-27
originSessionId: current
---

# vite-prerender-plugin 빌드 hang — Vercel 배포가 막혔던 문제

옵션 2 구현이 끝나고 로컬에서 정적 HTML 산출물까지 확인한 뒤 Vercel에 배포를 걸었습니다. 그런데 빌드가 끝나지 않았습니다. 로컬에서 분명 4.5초에 완료되던 빌드가 Vercel 환경에서는 45분 timeout으로 실패했고, prerender 산출물은 생성됐지만 deployment 자체가 시작되지 않는 상태였습니다.

산출물을 보면 빌드는 분명 성공한 것처럼 보였습니다. `dist/index.html`, `dist/privacy/index.html`, `dist/terms/index.html` 세 개가 정확히 생성되어 있었고 메타 태그도 정상이었습니다. 그런데 `npm run build` 프로세스 자체가 종료 신호를 보내지 못해 CI가 빌드 실패로 처리하고 있었습니다.

## 증상의 정확한 정의

문제를 다시 정리하면 이렇습니다. **빌드는 끝났는데 프로세스가 죽지 않는다.** vite는 자체 작업을 끝냈고 산출물도 다 썼지만 Node 프로세스가 idle 상태로 남아 exit 신호를 보내지 못하는 상황입니다. CI는 빌드 명령의 종료를 기다리기 때문에 timeout이 곧 빌드 실패로 처리됩니다.

산출물 자체는 정확하다는 점이 진단을 어렵게 만들었습니다. "빌드 실패"라는 표면 증상만 보면 코드나 설정에 문제가 있다고 의심하게 되는데, 실제 산출물은 멀쩡했습니다. 핵심 사실은 **빌드 명령이 종료 신호를 보내지 못해 CI가 빌드 실패로 간주한다**는 한 줄로 요약됩니다.

## 첫 가설과 그 폐기

처음에는 esbuild service의 잔류 핸들을 의심했습니다. vite는 내부적으로 esbuild를 자식 프로세스처럼 띄우는데, 이게 깔끔하게 정리되지 않으면 부모 프로세스가 매달려 있을 수 있다는 직관이었습니다.

그런데 GitHub 이슈를 추적하다가 `preactjs/vite-prerender-plugin#3`에서 reporter가 prerender 함수를 하드코딩 HTML로 바꿔봤더니 hang이 사라졌다는 격리 디버깅 결과를 발견했습니다. 이 한 문장으로 가설이 좁혀졌습니다. esbuild가 아니라 **`react-dom/server`의 `renderToString`이 Node 이벤트 루프에 잔류 핸들(타이머·소켓 등)을 남긴다**는 게 진짜 원인이었습니다.

이 결함은 라이브러리 메인테이너에게 1년 이상 미해결 상태입니다. Issue #3은 2025-01에 오픈됐고 메인테이너 응답 0건, PR 0건. 동일 패턴이 다른 SSG 도구에서도 보고되어 있습니다.

- `TanStack/router#6602` — SSR setTimeout 잔류로 process.exit 실패. `closeBundle` + `process.exit(0)` 패턴을 권장으로 명시
- `vikejs/vike#830` — prerender 도중 build crash
- `remix-run/react-router#13053` — pre-rendering hangs the build process

라이브러리 단의 문제가 아니라 React 19 + `react-dom/server` 조합 자체의 알려진 이슈였습니다. SSG 도구를 갈아타도 같은 패턴을 만나게 된다는 뜻이었습니다.

## 회피 방법

자체 vite 플러그인의 `closeBundle` 훅에서 `process.exit(0)`을 호출하는 방식입니다.

```ts
import { defineConfig, type Plugin } from 'vite';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

const forceExitAfterBuild = (): Plugin => ({
  name: 'force-exit-after-build',
  apply: 'build',
  enforce: 'post',
  closeBundle() {
    process.exit(0);
  },
});

export default defineConfig({
  plugins: [
    // ...other plugins
    vitePrerenderPlugin({ /* ... */ }),
    forceExitAfterBuild(),
  ],
});
```

세 조각의 조합이 이 우회의 핵심입니다. 한 조각만 봐도 이유가 분명하지 않은데, 셋이 같이 있어야 의도가 정확히 맞물립니다.

- **`closeBundle` 훅**: 모든 산출물 기록과 다른 플러그인의 cleanup이 끝난 마지막 시점입니다. 이 시점에 죽이면 데이터 손실이 없습니다
- **`process.exit(0)`**: 잔류 핸들을 무시하고 종료 신호를 보냅니다. 종료 코드 0이라 CI는 빌드 성공으로 처리합니다
- **`apply: 'build'` + `enforce: 'post'`**: dev 서버에선 차단되어 HMR을 보호하고, build 모드에서는 다른 플러그인 closeBundle 다음에 실행됩니다

## 검증 결과

| 지표 | 우회 전 | 우회 후 (커밋 6d234cc) |
|---|---|---|
| 로컬 vite build | 무한 hang | 9초 정상 종료 |
| Vercel 빌드 | 45분 timeout 실패 | 14초 완료 |
| Prerender 산출물 | 생성 후 매장 | 3개 모두 배포 |

`/`, `/privacy`, `/terms` 세 페이지 모두 title·description·canonical·og:title이 정상 주입됐고, LandingPage 본문도 정적 HTML로 삽입된 것을 확인했습니다.

## 헷갈리기 쉬운 선택지 — protocolTimeout

검색하면 다른 prerender 플러그인(`prerender-spa-plugin`, `vite-plugin-prerender` 등 Puppeteer 기반) 대상으로 "`protocolTimeout`을 늘려라"는 조언이 나옵니다. 이 조언은 우리 상황에 맞지 않습니다. `preactjs/vite-prerender-plugin`은 `node-html-parser` 기반 정적 파싱이라 브라우저 프로토콜 자체가 없고, 타임아웃을 늘려도 hang은 그대로입니다. 종료를 더 오래 기다리는 것뿐입니다.

빌드 도구 진단에서 검색 결과를 그대로 적용하기 전에 도구의 동작 방식부터 확인해야 한다는 사례입니다.

## 현재 조치의 한계점

`process.exit(0)` 우회는 즉효였지만, 일반적인 부수 효과를 가진 도구입니다. 이번 작업에서는 영향 없음을 확인했지만 미래 변경 시 다시 점검해야 할 항목들을 박제해둡니다.

### 1. 라이브러리 결함 자체는 미해결

`vite-prerender-plugin`이 Issue #3을 fix하거나 다른 도구로 교체하기 전까지 본 우회를 유지해야 합니다. 메인테이너 응답이 1년 이상 없는 상태라 단기간 내 fix는 기대하기 어렵습니다.

### 2. vite 메이저 업그레이드 시 재검증 필요

vite 7→8 같은 메이저 업그레이드가 이뤄지면 `closeBundle` 훅의 호출 시점이나 동작이 달라질 수 있습니다. 그 시점에 우회가 여전히 작동하는지, 그리고 라이브러리 자체가 fix됐는지를 같이 확인해야 합니다.

### 3. 에러 마스킹 가능성

종료 코드가 무조건 0이라 closeBundle 시점에 silent error가 발생해도 CI는 빌드 성공으로 처리합니다. 현재 vite 동작상 closeBundle은 빌드 성공 시에만 호출되지만 외부 보장은 없습니다.

### 4. stdout/stderr 버퍼 flush 안 됨

Node `process.exit`은 즉시 종료라 마지막 로그 라인이 손실될 수 있습니다. CI 로그 끝부분이 누락될 가능성이 있어, 빌드 디버깅 시 마지막 출력을 신뢰할 수 없는 상황이 올 수 있습니다.

### 5. 다른 post-build hook 차단 위험

향후 Sentry release 업로드, sourcemap 외부 전송, 빌드 통계 보고 같은 closeBundle 후속 작업을 추가하면 `enforce: 'post'`인 우리 플러그인이 그 작업을 죽일 수 있습니다. 이 위험은 시나리오로 풀어 따로 정리해뒀습니다(아래 섹션).

### 6. 프로그래밍적 vite build 호출 차단

`await build()` 형태로 vite를 라이브러리처럼 호출하는 코드(테스트, 커스텀 빌드 스크립트)가 생기면 호출자 컨텍스트도 같이 죽습니다. 현재는 `npm run build`만 쓰니 영향이 없지만 future risk로 남겨둡니다.

### 7. 향후 라이브러리 업데이트가 closeBundle 이후 작업을 추가할 가능성

`vite-prerender-plugin` 업데이트가 closeBundle 이후의 정리 작업을 추가하면 우리 우회가 그 작업을 건너뜁니다. 현재 산출물은 정상이므로 영향 없음을 확인했지만, 플러그인 업데이트 시마다 점검이 필요합니다.

## 다른 closeBundle plugin 추가 시 시나리오 (한계점 #5 상세)

vite는 `closeBundle` 훅을 모든 plugin에 한 번씩 호출합니다. 호출 순서는 두 단계로 결정됩니다.

- **1차**: `enforce` 단계 — `'pre'` 먼저, `undefined` 중간, `'post'` 마지막
- **2차**: 같은 단계 내 — plugin 배열 등록 순서대로

향후 Sentry release 업로드 같은 closeBundle 사용 plugin이 추가되면 우리 `forceExitAfterBuild`와 충돌할 수 있습니다. 세 가지 케이스로 시각화합니다.

### 시나리오 A — 안전 (Sentry default + forceExit가 'post')

```ts
plugins: [
  react(),
  tailwindcss(),
  vitePrerenderPlugin({...}),
  sentryVitePlugin({...}),       // enforce 없음 → 중간 단계
  forceExitAfterBuild(),         // enforce: 'post' → 마지막 단계
]
```

closeBundle 실행 흐름:

```
[react/tailwind 정리] → [vitePrerender 정리] → [Sentry 업로드] → [forceExit]
   (중간)                  (중간)                (중간, await)        (post)
                                                     ✓ 완료              ↓
                                                                  process.exit(0)
```

Sentry 업로드 완료 후 우리가 종료. 안전합니다.

### 시나리오 B — 위험 (forceExit이 plugin 배열 더 먼저, Sentry도 'post')

```ts
plugins: [
  react(),
  tailwindcss(),
  vitePrerenderPlugin({...}),
  forceExitAfterBuild(),                          // enforce: 'post', 먼저 등록
  sentryVitePlugin({ enforce: 'post', ... }),     // 같은 'post', 나중 등록
]
```

```
[vitePrerender 정리] → [forceExit]               [Sentry 업로드]
   (중간)                (post, 먼저 등록)         호출 안 됨
                            ↓                       (process가 이미 죽음)
                     process.exit(0)
                     (Node 즉시 종료)
```

Sentry release 업로드가 안 됩니다. 더 위험한 점은, 우리가 `exit(0)`을 보냈기 때문에 **Vercel은 빌드 성공으로 처리**한다는 것입니다. silent failure입니다.

### 시나리오 C — 같은 'post' + forceExit이 배열 마지막

```ts
plugins: [
  ...,
  sentryVitePlugin({ enforce: 'post', ... }),  // 같은 단계, 먼저 등록
  forceExitAfterBuild(),                       // 같은 단계, 나중 등록
]
```

```
[Sentry 업로드 시작] → await 대기 → [forceExit]
   (post)                              (post)
     ↓                                    ↓
  비동기 시작           완료 후         process.exit(0)
```

안전합니다. 단, **Sentry plugin의 closeBundle이 Promise를 정상 반환해서 vite가 await할 수 있어야** 합니다. fire-and-forget로 비동기를 던지고 즉시 리턴하면 시나리오 B와 같은 race condition이 됩니다.

### 적용 규칙

- `forceExitAfterBuild`는 항상 plugin 배열 **맨 마지막에** 등록합니다
- 다른 plugin이 `enforce: 'post'`를 함께 쓰는지 확인합니다
- 다른 plugin의 closeBundle이 Promise를 반환하는지(즉 vite가 `await` 가능한지) 확인합니다
- 의심되면 plugin 도입 시 `forceExitAfterBuild`를 잠시 빼고 빌드가 정상 종료되는지 점검합니다. 정상 종료된다면 그 plugin이 prerender hang을 해소했거나 무관하게 잘 작동하는 신호입니다

## 회고: 두 가지 배움

첫 번째 배움은 **표면 증상과 실제 결함을 분리하는 것의 가치**였습니다. "빌드 실패"라는 표면 증상만 보면 코드나 설정 문제로 의심하게 되는데, 산출물을 먼저 확인하니 "산출물은 정확한데 프로세스가 죽지 않는다"는 정확한 정의가 나왔습니다. 이 정의가 있으니 검색 키워드도 정확해졌고, GitHub 이슈도 빠르게 찾을 수 있었습니다. 증상을 정확히 정의하는 데 5분 더 쓰는 것이 나머지 디버깅 시간을 결정합니다.

두 번째 배움은 **첫 가설을 빠르게 폐기하는 능력**이었습니다. esbuild service 잔류 가설은 합리적이었지만, GitHub 이슈에서 reporter의 격리 디버깅(prerender 함수를 하드코딩으로 바꾸면 hang이 사라짐) 한 문장만 보고 즉시 가설을 갈아탔습니다. 자기 가설에 매몰되지 않고 1차 소스(reporter의 격리 결과)를 그대로 신뢰한 것이 진단 시간을 크게 줄였습니다.

또 하나 부수적 배움이 있었는데, `process.exit(0)`처럼 강력한 도구는 즉효지만 일반적 부수 효과(에러 마스킹, 버퍼 flush 손실, post-hook 차단)를 같이 들고 들어옵니다. 이번 작업에서는 영향이 없음을 확인했지만, 같은 도구를 쓰는 미래의 결정에서 점검할 항목으로 7개의 한계점을 박제해둔 것이 이 우회의 본질적 비용을 직시하게 해줍니다. 우회는 "동작한다"와 "건전하다"가 다른 명제이고, 한계점 박제는 그 차이를 시간이 지나도 잊지 않게 하는 장치입니다.
