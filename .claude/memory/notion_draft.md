---
name: 업로드 대기 초안
description: 노션에 작성할 초안. /post-notion-draft로 업로드 가능.
type: draft
updated: 2026-04-28
originSessionId: current
---

# [페이지 1 — 설계 결정] 04-28 — GA4 G-02 7종 이벤트 구현 결정

## 1. 다중 분기 reaction을 단일 이벤트로 통합

**문제:**
PM 정식 스펙(2026-04-27)이 6분기를 가진 reaction 동작(좋아요/궁금/유용/스크랩/댓글/다운로드)을 어떻게 GA4에 보낼지 구현 레이어를 명시하지 않았습니다. 분기마다 별도 이벤트로 보낼 것인지, 한 이벤트의 type 파라미터로 분기할 것인지 결정이 필요했습니다.

**검토한 선택지:**
- (a) like/curious/useful/scrap/comment/download 6개 이벤트 분리 — 대시보드에서 별도 카운트 즉시 보임
- (b) reaction 단일 이벤트 + type 파라미터 6분기 — 대시보드 보고서에서 type별 breakdown 한 단계 추가됨
- (c) 본문 리액션(LIKE/CURIOUS/USEFUL)만 묶고 scrap/comment/download는 분리 — 두 층의 묶음 기준이 섞여 일관성 떨어짐

**결정:** (b) 단일 이벤트 + type 파라미터

GA4 이벤트 종류는 무료 티어(스트림당 50종) 한도가 있어 종류 인플레이션을 피해야 합니다. 6개를 분리하면 향후 카테고리 추가 때마다 한 슬롯씩 갉아먹습니다. type 파라미터로 분기하면 Looker Studio에서 `event_name = 'reaction' AND event_param.type = 'react_like'` 식으로 동등하게 카운트할 수 있어 정보 손실이 없습니다.

백엔드 도메인 enum(`ReactionType: LIKE/CURIOUS/USEFUL`)과 GA4 이벤트 enum을 분리해(`ReactionEventType`) 같은 이름이 두 의미로 쓰이는 혼선을 차단했습니다. 호출 사이트(`useReactionToggle`)에서 `LIKE → react_like` 매핑을 처리합니다.

---

## 2. screen_exit 이탈 신호 통합

**문제:**
"피드/글쓰기/마이페이지 체류 시간"을 측정하려면 사용자가 페이지를 떠나는 신호를 잡아야 합니다. 라우트 변경, 탭 숨김, 탭 닫기 — 세 가지 이탈 신호 중 하나만 잡으면 누락이 생기고, 셋 다 잡으면 중복이 생깁니다.

**검토한 선택지:**
- (a) `beforeunload`만 사용 — 모바일 환경에서는 거의 발화하지 않아 누락 큼
- (b) `visibilitychange → hidden`만 사용 — 라우트 변경 케이스(SPA 내부 이동)를 못 잡음
- (c) 셋 다 잡고 1초 미만 노이즈 컷으로 중복 흡수

**결정:** (c) 세 신호 통합 + 노이즈 컷

"총합 기준" 분석 정확도가 우선입니다. 약간의 중복(hidden → close 흐름에서 두 번 발화 가능)은 1초 노이즈 필터로 자동 컷됩니다. 신호 한 가지만 신뢰하면 케이스별 누락이 누적돼 더 큰 손실로 이어집니다.

`transport_type: 'beacon'`을 명시해 unload 케이스에서도 `navigator.sendBeacon` 큐에 실어 전송 유실을 막았습니다. 한 페이지에서 여러 차례 hidden/visible을 반복할 수 있으므로, 발송 직후 `enterTimeRef`를 현재 시각으로 갱신해 다음 구간의 시작점으로 재사용합니다(visible 복귀 케이스도 자연스럽게 이어집니다).

---

## 3. StrictMode 더블 마운트 가드 (cert_started/cert_completed)

**문제:**
React 19 StrictMode 환경에서 mount 시점 1회 발화하는 이벤트가 두 번 발사됩니다. cert_started처럼 "동작 1회당 이벤트 1회"가 강한 이벤트는 더블카운트가 데이터를 오염시킵니다.

**검토한 선택지:**
- (a) StrictMode 비활성화 — 다른 컴포넌트의 검사 능력 손실, 영향 범위 너무 큼
- (b) ref 가드(`firedRef.current`)로 두 번째 mount 차단 — 페이지 단위로만 적용

**결정:** (b) ref 가드

`useEffect` 안에서 `firedRef.current`를 체크해 한 페이지 라이프사이클당 한 번만 발화하도록 가드했습니다. screen_exit처럼 cleanup 시점 발화 이벤트는 cleanup 자체가 한 번이라 가드 불필요.

---

## 4. dev 콘솔 가드 1줄 패턴

**문제:**
헬퍼가 GA4로 잘 보내는지 dev에서 빠르게 확인하고 싶은데, production에 console.log가 남으면 안 됩니다.

**결정:** `if (import.meta.env.DEV) console.log('[GA4]', name, params)` 1줄을 헬퍼 진입점에 둡니다.

Vite 트리쉐이킹이 production 빌드에서 이 라인을 제거합니다(`import.meta.env.DEV`는 빌드 타임 상수). 호출 사이트마다 직접 console을 추가/제거하지 않고 헬퍼 한 곳에서 끄고 켤 수 있습니다.

---

## 5. TherapistVerificationPage redirect 흐름 fix (부수 효과)

이번 작업 중 발견한 회귀입니다. cert_completed 이벤트를 삽입하는 과정에서 redirect 발화 위치 버그가 드러났습니다.

**문제:**
mount 시 `fetchVerification`을 부르고, 동시에 페이지 외부에서 `setVerification`이 발화되면 `useEffect`의 redirect 트리거가 두 번 평가되며 의도치 않은 페이지 이동이 발생했습니다.

**결정:** redirect를 mount fetch의 `.then` 안으로 이동했습니다.

setVerification으로 인한 추후 재평가가 redirect를 발화시키지 않습니다. cert_completed 이벤트 삽입 검증 도중에 발견된 실효 버그라, 본 결정과 같은 커밋(e15a065)에 함께 묶었습니다.

---

## 한계점

이번 결정들은 의도한 효과를 달성했지만, 같이 들어온 부수 효과를 박제해둡니다.

### 1. reaction 통합 분기의 보고서 비용

GA4 explore 보고서에서 분기별 카운트를 보려면 type 파라미터 필터 한 단계가 추가됩니다. PM이 분기별 raw 카운트를 자주 본다면 dashboard에 type 파라미터 breakdown 뷰를 별도 저장해두는 운영이 필요합니다.

### 2. screen_exit 1초 노이즈 컷의 사각

노이즈 컷이 1초 고정이라, 정상 빠른 이탈(예: 잘못 들어왔다 즉시 나가는 사용자)은 측정에서 빠집니다. "체류 시간"의 정의에 부합하긴 하지만, "이탈률" 분석에는 부족할 수 있습니다.

### 3. StrictMode 가드의 산발적 박힘

가드가 페이지 컴포넌트 단위로 박혀 있어, 새로운 1회 발화 이벤트를 추가할 때마다 가드를 같이 박아야 합니다(공통 훅으로 추출 안 됨). 추가 시 누락 위험이 누적됩니다.

### 4. 트리쉐이킹의 빌드 도구 의존

dev 콘솔 로그가 production에서 트리쉐이킹된다는 보장은 Vite의 빌드 동작에 의존합니다. 빌드 도구를 갈아탈 때 재검증이 필요합니다.

---

# [페이지 2 — 트러블슈팅] #TBD — 백엔드 응답 형식 mismatch 디버깅 2건 묶음

**날짜**: 2026-04-28
**분류**: 디버깅 / 프론트-백엔드 인터페이스
**난이도**: 중

두 건의 버그를 같은 날 한 묶음으로 다룬 이유는, 모두 "프론트가 가정한 응답 ≠ 실제 응답"이라는 같은 패턴이기 때문입니다. 각각의 fix는 짧지만, 묶어 두면 인터페이스 가정 검증의 체크리스트로 재사용할 수 있습니다.

## 사례 1 — createdAt이 9시간 어긋남

### 문제 상황

백엔드가 보낸 `createdAt: "2026-04-28T10:07:13.263226"`을 `formatRelativeTime`이 9시간 늦게 표시했습니다. 이상한 점은, MSW 모킹으로 같은 흐름을 재현하면 정상이었습니다.

### 원인 분석

백엔드(Spring Boot LocalDateTime)가 timezone designator 없이 UTC 시각을 직렬화해 보냈습니다. `Z`나 `+09:00`이 없으면 JavaScript의 `new Date()`는 그 문자열을 **로컬 시각**으로 파싱합니다(ECMA-262 명세). 즉 KST로 해석되어 실제 UTC 시각보다 9시간 빠른 시점으로 변환되었습니다. MSW 모킹은 응답에 `Z`가 붙어 있어 재현이 안 됐습니다.

### 해결 과정

`utils/formatDate.ts`에 `parseServerDate` 가드를 추가했습니다.

```ts
export function parseServerDate(isoString: string): Date {
  const hasTz = /(Z|[+-]\d{2}:?\d{2})$/.test(isoString);
  return new Date(hasTz ? isoString : isoString + 'Z');
}
```

이미 timezone이 붙어 있으면 그대로 두고, 없으면 `Z`를 부착해 UTC로 명시해 파싱합니다. `formatRelativeTime`을 비롯한 사용처를 모두 이 가드를 통과하도록 바꿨습니다.

### 핵심 개념

- ISO 8601에서 timezone designator가 없으면 `new Date()`는 "로컬 타임"으로 해석합니다
- 백엔드 LocalDateTime은 시각 자체에 timezone 정보가 없는 타입입니다 — 직렬화 시 어떤 타임존으로 해석할지 별도 합의가 필요합니다
- MSW 모킹은 백엔드 직렬화 형식까지 시뮬레이션하지 않으면 회귀 재현에 실패합니다

### 면접 포인트

- 시각 직렬화에서 "값"과 "타임존 정보"는 분리된 두 개념입니다. 시각만 보내고 timezone을 약속으로 두면 한 쪽이 잊는 순간 9시간 어긋납니다
- 프론트 가드는 백엔드의 합의 위반을 막아주는 두 번째 방어선이지만, 근본 fix는 백엔드가 `OffsetDateTime`/`Instant`로 직렬화하는 쪽입니다

---

## 사례 2 — 댓글 상세 대댓글 미노출

### 문제 상황

댓글 상세 페이지(`CommentDetailPage`)에 진입하면 대댓글이 항상 0건이었습니다. 작성 직후에는 보였다가 새로고침/재진입 시 사라졌습니다.

### 원인 분석

`GET /posts/{id}/comments`가 부모 댓글의 `replies[]`에 대댓글을 nested(트리)로 내려주는 형태였습니다. 그런데 프론트(`PostDetailPage`/`CommentDetailPage`)는 한 배열에 flat하게 들어 있고 `parentCommentId`로 트리를 재구성하는 가정이라, 부모만 보이고 nested된 replies는 사라지는 상태였습니다.

작성 직후에 보였다 사라진 이유는, optimistic update가 flat 가정으로 새 댓글을 추가하기 때문입니다 — 작성 직후엔 flat이라 보이고, 재페치하면 nested가 와서 다시 사라지는 흐름이었습니다.

### 해결 과정

`fetchComments` 진입점에서 한 번 평탄화해 호출부 가정과 맞췄습니다.

```ts
const tree: CommentResponse[] = res.data ?? [];
return tree.flatMap((parent) => [parent, ...(parent.replies ?? [])]);
```

이 어댑터를 거친 뒤로는 작성/삭제/수정 모두 flat 위에서 닫혀 트리 변환은 1회뿐입니다.

### 핵심 개념

- 같은 데이터를 표현하는 여러 형태(flat/tree) 중 어느 쪽으로 둘지의 합의가 인터페이스의 일부입니다
- 어댑터는 가능하면 진입점 한 곳에 두는 것이, 모든 호출 사이트에 분기를 박는 것보다 회귀가 적습니다

### 면접 포인트

- "응답 형태가 가정과 다를 때" 어디에서 정합화할지의 결정 — 호출부마다 분기 vs API 클라이언트 진입점에서 어댑터
- optimistic update가 가정 mismatch를 가려서 "보였다가 사라지는" 증상이 나오는 패턴 — 디버깅 단서로 가치 있음

---

## 공통 패턴

두 사례 모두 "프론트가 가정한 응답 ≠ 실제 응답"이었고, 각각 다른 layer에서 발생했습니다.

| 사례 | 프론트 가정 | 실제 |
|---|---|---|
| createdAt 9시간 | 모든 ISO 문자열은 UTC 또는 timezone 명시 | LocalDateTime은 timezone 없이 직렬화 |
| 댓글 트리 | API가 flat 배열로 응답 | nested(replies[]) 트리로 응답 |

각각의 fix는 우회/어댑터 한두 줄이지만, 박제할 가치는 "검증해야 할 가정의 목록"입니다. 다음에 비슷한 mismatch가 의심될 때 두 축(직렬화 형식 / 자료구조 형태)을 먼저 점검하면 디버깅 시간이 짧아집니다.

## 한계점

### 1. parseServerDate는 임시 방어선

`parseServerDate` 가드는 백엔드가 합의한 형식(UTC + Z 부착)으로 바꾸기 전까지의 임시 방어선입니다. 백엔드가 `Instant`/`OffsetDateTime`으로 변경하면 가드는 그대로 둬도 무해하지만, 근본 원인은 다른 곳에 있다는 사실은 잊지 말아야 합니다.

### 2. 트리 평탄화는 깊이 정책에 종속

댓글 트리 평탄화 어댑터는 한 곳에서 닫혀 있어 안전합니다. 다만 향후 백엔드가 트리 깊이를 2단계 이상으로 확장하면 평탄화 자체가 정보 손실이 됩니다(중첩 깊이가 사라짐). 현재 정책상 2레벨이지만, 정책 변경 시 어댑터 재설계가 필요합니다.

### 3. MSW 모킹의 직렬화 시뮬레이션 갭

createdAt 회귀가 MSW에서 재현되지 않은 이유는, mock 데이터가 백엔드의 직렬화 형식까지 시뮬레이션하지 않기 때문입니다. MSW는 응답 스키마 시뮬레이터이지 백엔드 동작 시뮬레이터가 아니라는 점을 다시 확인하게 됐고, 향후 mock 데이터에 의도적으로 timezone 누락 케이스를 섞어 회귀 검출력을 보강할 가치가 있습니다.
