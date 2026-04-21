# 노션 업로드 대기 초안

## 2026-04-21 — 프로필 편집 검증, URL 정규화 리팩토링, 증거 기반 백엔드 협업

**분류**: TIL — 프론트엔드 리팩토링 + 트러블슈팅 + 협업 프로세스
**페이지**: TIL 서브페이지 (`323c8200749b80c2bbe6caf194055593`)

### 오늘 한 것

**1. PATCH /me 스펙 변경 반영 → 실서버 검증**
- 백엔드가 PATCH /me 바디를 `{ nickname?: string }` 단일 필드로 정리한 덕에, 어제 추가했던 임시 가드(T1/T2 + 레이스 가드 3곳) 전량 제거 (`9261733`)
- 실서버 회귀 검증 (A-1~A-4):
  - A-1 닉네임만 PATCH → 정상
  - A-2 이미지만 POST → 정상
  - A-3 **동시 변경** → 두 요청 독립 성공, 서버 최종 상태 정확, 레이스 없음
  - A-4 중복 닉네임 에러 → alert 분기 정상
- 결과: "근본 원인(동일 요청에 두 필드 동시 전송)이 사라졌다"는 판단이 실서버에서 유효함 확인

**2. resolveImageUrl `new URL` 기반 안전화 (T3, `a1b7532`, `d604418`)**
- regex + 문자열 접합 → 브라우저 표준 `new URL(input, base)` 위임
- 엣지 케이스 방어: 절대/`//`/`/`/상대 전부 표준 규칙대로 처리
- 실패 시 null 반환 계약 (호출부가 맥락에 맞게 fallback UI 결정)

**3. 게시글 이미지 렌더 이슈 — 2단계 진단 + 증거 기반 백엔드 협업**
- **1단계**: 응답 `imageUrl`이 상대경로 → 브라우저가 Vercel 도메인으로 해석 → 404
  → `resolveImageUrl` 호출부에 적용 (`6a375e1`) → 올바른 API 서버 도달
- **2단계 재진단**: URL은 맞게 갔으나 `401 UNAUTHORIZED`
  → 원인은 URL 층이 아닌 인증 층
  → `<img src>`는 Authorization 헤더 실을 수 없는 브라우저 스펙 제약
- **증거 패키지**: curl로 Bearer 유/무에 따른 200(PNG)/401 대비 확인 → 백엔드에 쟁점만 전달
- **백엔드 결정 수신(메신저)**: presigned URL 방식 채택 (구현 중)
- **프론트 선제 대응 보류**: fetch+Blob 유틸을 미리 쓰지 않음 → presigned 확정 후엔 죽은 코드가 되므로

### 배운 것 / 인사이트

**증상 ≠ 원인 (레이어 분리 사고)**
- 1층 해결(URL 정규화 → 404 해소)이 완료되자 2층(401)이 드러남
- 증상이 바뀌면 원인이 더 안쪽에 남아있을 수 있다는 감각 체화

**`new URL(input, base)` 의 4가지 분기**
- 절대 URL → base 무시
- `//host/...` → base의 scheme만 빌림
- `/path` → base의 origin + 입력 path로 교체
- 상대 → base 경로 기준 결합
- 브라우저 표준 위임 = regex 직접 분기보다 견고 + 무료 엣지 케이스 처리

**`<img>` 태그와 Authorization 제약**
- 브라우저가 자동 생성하는 요청 → Authorization 커스터마이즈 불가
- 이미지 보호 설계 3옵션:
  - Public (UUID 기반 obscurity) — profileImageUrl 방식
  - Presigned URL — 본 프로젝트 채택 예정
  - Cookie 기반 auth — 아키텍처 변경 비용 큼
- 트레이드오프 숙지가 곧 설계 결정 참여 역량

> 💡 **강조 — 관심사 분리: "resolveImageUrl의 책임 경계"**
>
> 유틸은 **"유효한 URL을 만들 수 없으면 null"** 까지만 책임.
> null일 때 무엇을 보여줄지는 각 호출부가 결정.
>
> - `UserAvatar`: 이니셜 아바타 렌더
> - `PostDetailPage`: 빈 src (깨진 아이콘)
> - `FilePreviewGrid`: 빈 src
>
> **비유**: resolveImageUrl은 "주소를 만드는 사람", 호출부는 "그 주소로 움직이는 택배기사". 각자 맥락에 맞게 대응.
>
> **경계가 흐려지면**: 유틸이 UI 정책을 품게 되어 새로운 UI 시나리오마다 유틸 비대화, 호출부 간 UI 일관성 붕괴. 순수 변환 vs UI 결정 분리 → 각자 독립적으로 변경 가능.

### 포트폴리오 어필 포인트

- **"임시 workaround를 만들지 않은 판단"** — 401 확인 후 프론트 Blob 유틸 선제 작성 대신 curl 증거로 백엔드 문의. presigned 결정 수신 후엔 그 유틸이 죽은 코드가 됐을 것. "스펙/상태 재확인 후 조치" 원칙 실적용
- **증거 기반 팀 협업** — curl Bearer 유/무 비교 결과로 쟁점을 명확히 좁혀 전달. 백엔드 의사결정 시간 단축에 기여
- **실서버 검증 기반 가드 해제** — 스펙 변경만 믿고 제거하지 않고 동시 변경 시나리오(A-3) 실제 재현 검증. "검증으로 뒷받침되는 리팩토링"
- **브라우저 표준 활용** — 수작업 regex 대신 `new URL` 위임. 엣지 케이스 대응 비용 0

---

## 2026-04-21 — AxiosError 분기 모듈화 (lookup table 패턴)

**분류**: TIL — TypeScript / 에러 처리 / UX
**페이지**: TIL 서브페이지 (`323c8200749b80c2bbe6caf194055593`)

### 오늘 한 것

프로필 페이지의 `catch {}` 빈 블록을 걷어내고 status별로 사용자 메시지를 분기하는 유틸 `getAxiosErrorMessage(err, context)`를 만들었다.

- `src/utils/getAxiosErrorMessage.ts` 신설
- `ProfilePage.tsx`의 3개 핸들러(`handleImageChange`, `handleSaveNickname`, `handleDeleteAccount`) catch 블록 일괄 교체: `console.error(err)` + `toast.error(getAxiosErrorMessage(err, 'image'))`
- `alert()` 2건(선검사 실패)도 `toast.error`로 통일 (sonner 도입)
- 커밋 `4dec45f`

### 배운 것 / 인사이트

**1. AxiosError narrowing — `unknown`에서 속성 접근하려면 타입 가드가 먼저**

```ts
if (!isAxiosError(err)) return DEFAULT_MESSAGE;
// 여기 아래에선 err가 AxiosError로 좁혀짐
const status = err.response?.status;
```

axios의 `isAxiosError`는 타입 가드 — early return 패턴으로 중첩 없이 처리. `unknown` 타입은 직접 속성 접근 불가이므로 가드가 필수.

**2. 에러 매핑을 데이터 구조(lookup table)로 분리**

```ts
const messages: Record<Context, Record<number, string>> = {
  image: { 413: '5MB 이하...', 415: '지원하지 않는...', 401: UNAUTHORIZED_MESSAGE },
  nickname: { 409: '이미 사용 중...', 400: '형식이 올바르지...', 401: UNAUTHORIZED_MESSAGE },
  delete: { 401: UNAUTHORIZED_MESSAGE },
};
return messages[context][status] ?? DEFAULT_MESSAGE;
```

**왜 데이터 구조인가**: 관심사 분리 — 분기 로직(`if`)과 매핑 데이터(`Record`)가 섞이지 않음. 새 status 추가는 표에 한 줄만 추가, 로직은 손 안 댐. 테스트도 매핑 테이블만 검증하면 전체 케이스 커버.

**3. 분기 범위 판단 기준 — "사용자가 행동 바꿀 수 있는 status만"**

- `413`(용량): "작은 파일로" → 분기 가치 있음
- `409`(닉네임 중복): "다른 닉네임으로" → 분기 가치 있음
- `502`(Bad Gateway): 사용자가 할 수 있는 게 없음 → 기본 문구

분기는 **UX 투자**지 기술적 의무가 아니다. 모든 status를 분기하면 유지보수 부담만 늘고 사용자 경험은 그대로.

**4. catch 빈 블록은 "에러를 삼킨다"**

기존 `catch {}` — 에러가 나도 조용히 씹힘. 개발자는 디버깅 못 하고, 사용자는 "실패" 한 줄만 본다.

두 방향으로 흘려보내야 함:
- 개발자 방향: `console.error(err)` (최소한)
- 사용자 방향: status 기반 메시지 (의미 있을 때만 분기)

### 포트폴리오 어필 포인트

- **"에러 매핑을 데이터 구조로 분리한 이유는?"** — 관심사 분리. 분기 로직과 매핑 데이터가 섞이면 새 status 추가할 때 로직까지 건드림. Record 자료구조로 표현하면 표만 늘리면 됨
- **"모든 에러를 분기하지 않은 이유는?"** — "사용자가 다음 행동 바꿀 수 있는가"가 기준. 모든 분기는 유지보수 비용이라 UX 투자 대비 효과를 본다
- **"AxiosError 타입 좁히기는 어떻게?"** — `isAxiosError` 타입 가드 + early return. TypeScript `unknown`에서 속성 접근하려면 타입 가드로 좁혀야 하고, axios 헬퍼로 라이브러리 계약을 명시적 활용

---

## 2026-04-21 — 유니온 타입 단일화 리팩터 (도메인 엔티티 vs API 응답 계약)

**분류**: TIL — TypeScript / 타입 설계 / 리팩터
**페이지**: TIL 서브페이지 (`323c8200749b80c2bbe6caf194055593`)

### 오늘 한 것

Zustand 스토어의 `user` 타입이 `LoginUser | MeResponse | null` 유니온이었는데, `MeResponse | null` 단일 타입으로 통합. `LoginUser` 인터페이스 삭제.

- `src/types/auth.ts`: `LoginUser` 삭제, `LoginResponse.user`를 `MeResponse`로 변경
- `src/stores/useAuthStore.ts`: store의 `user` 타입과 `setUser` 시그니처 모두 유니온 제거
- 커밋 `083322c` — 2 files, +4/-14 (순 제거)

### 배운 것 / 인사이트

**1. 유니온 타입의 실제 위험 — narrowing + spread**

- **narrowing 부담**: 공통 필드만 안전하게 접근 가능, 나머지는 `in` 연산자나 타입 가드로 좁혀야 함
- **spread 위험**: `setUser({ ...user, nickname })` 시 타입이 뭉개져 런타임 상태가 선언과 어긋날 소지

두 타입의 실제 차이는 작았다 (optional/required 여부, 필드 1개 유무). 그럼에도 유니온이라는 이유만으로 소비자가 narrowing 부담을 떠안는 구조.

**2. 도메인 엔티티 vs API 응답 계약 — 두 가지 관점**

| 관점 | 장점 | 단점 |
|---|---|---|
| **도메인 엔티티 (통합)** | 소비자 narrowing 불필요, 타입 1개 유지 | 한 API shape 급변 시 전체 영향 |
| **API 응답 계약 (분리)** | endpoint별 정확한 계약 | 유니온 narrowing 부담, 동기화 비용 |

내 경우는 **도메인 엔티티 관점**이 적합. `LoginUser`와 `MeResponse`는 본질적으로 "같은 사용자"의 다른 표현이고, MeResponse가 상위집합.

**3. 리팩터 안전성 — 소비자 grep으로 영향 사전 검증**

```bash
grep "user\.(canAccessCommunity|therapistVerification|communityAccessLevel)"
```

→ **0건**. 두 타입의 차이 필드를 직접 읽는 코드는 없었음. 공통 필드(`nickname`, `role`, `email`, `id`, `profileImageUrl`)만 소비 중.

TSC 통과는 컴파일 타임 계약 검증, grep은 런타임 호출 커버리지 검증. 두 증거로 **"현재 버그 없는 리팩터"** 임을 확신.

**4. 버그 없는 상태에서도 리팩터 가치를 판단하는 기준**

- **도메인 단순성**: 하나의 개념을 두 타입으로 쪼개지 않음
- **소비자 부담 감소**: narrowing 코드 제거, 미래 코드 복잡도 절감
- **변화 내성**: 새 필드 추가 시 한 곳만 수정

"지금 안 고쳐도 되지만, 확장될수록 부채가 커지는" 유형. MVP 단계라면 미루고, 소비자가 늘어나기 시작하면 지금 정리하는 게 효율적.

### 포트폴리오 어필 포인트

- **"두 타입을 왜 하나로 합쳤는가?"** — 본질적으로 동일한 도메인 엔티티의 두 표현. 필드 차이도 optional/required 수준이라 MeResponse가 상위집합. 유니온 유지 시 소비자 narrowing 부담 누적
- **"합쳐도 버그 안 나는 걸 어떻게 확인?"** — 차이 필드를 grep으로 소비자 전체 검색. 0건. TSC = 컴파일 타임, grep = 런타임 사용. 두 증거로 안전성 확보
- **"분리 타입의 장점은 버린 건 아닌가?"** — 나중에 한쪽 endpoint가 크게 달라지면 그 응답 타입만 별도 정의하는 방식으로 재분리 가능. 확장 여지 열어둠
