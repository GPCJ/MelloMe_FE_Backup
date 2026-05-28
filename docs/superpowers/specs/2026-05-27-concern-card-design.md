# 고민 카드(Concern Card) 기능 설계 스펙

- 작성일: 2026-05-27
- 정정: 2026-05-28 (백엔드 명세 확정 — Jira MEL-55 반영, flat 구조로 피벗)
- 단계: Post-MVP (프로토타입)
- 상태: 설계 확정, 백엔드 계약 확정(미배포)

> **2026-05-28 정정 요약**: 백엔드가 고민 카드를 **중첩 `concern` 객체가 아닌 flat 필드**로
> 구현했습니다(MEL-55). 이에 따라 ① `postType` 리터럴 `CONCERN` → `CONCERN_CARD`,
> ② 중첩 `concern{worry,...}` 객체 폐기 → 고민 본문은 기존 `content`, 나머지는 Post 최상위
> 필드(`therapyArea`/`ageGroup`/`diagnoses[]`/`otherNotes`), ③ FE 뷰모델/변환 어댑터 폐기
> (계약이 Post 모양과 1:1이라 격리 가치 소멸), ④ 권한 마스킹·피드 필터가 신규 추가됐습니다.
> 본문은 이 정정을 반영한 최종본입니다.

## 1. 배경과 목표

발달장애 아동 치료사가 임상 고민을 구조화된 카드 형태로 게시하고, 동료 치료사에게
조언을 구하는 기능입니다. 유저는 게시글 작성 모달에서 "고민 카드"를 선택해 정해진 폼을
채우고, 저장된 카드는 홈피드에 일반 게시글과 함께 노출되며, 상세 페이지에서 전체 내용을
확인합니다.

빠르게 출시해 반응을 보는 **프로토타입**입니다. 반응이 약하면 폐기할 수 있으므로,
기존 게시글 파이프라인(작성/피드/상세/댓글/리액션)을 최대한 재사용해 구현 비용을 낮춥니다.

## 2. 범위

포함:
- 작성 모달의 "일반 글 / 고민 카드" 타입 토글
- 고민 카드 입력 폼(고민/연령대/치료영역/진단명/기타)
- 진단명 자동완성 + 자유 입력 태그
- 피드/상세에서 고민 카드 표시(B안 레이아웃)
- 권한별 마스킹(USER 롤에 진단명/기타 비공개) 표시 처리

제외(현 단계 아님):
- 진단명 빈도 분석 기반 목록 자동 고도화(2단계)
- 진단명 enum화(데이터 축적 후 검토)
- 피드/내 글 `postType` 필터 탭(백엔드 파라미터는 준비됨 — 4.5절. UI 탭은 후속 백로그)

## 3. 데이터 모델 (백엔드 계약 확정 — MEL-55)

고민 카드는 `postType: 'CONCERN_CARD'`인 게시글이며, **별도 중첩 객체 없이** 구조화 필드가
Post 최상위에 flat하게 실립니다. 고민 본문은 기존 `content`를 그대로 사용합니다. 이렇게 하면
작성/피드/상세/댓글/리액션 파이프라인을 그대로 재사용할 수 있고, 진단명·치료영역·연령대
데이터가 구조화되어 추후 분석·필터링이 가능합니다.

### 3.1 PostType (기존 + 추가)

| 값 | 설명 |
| --- | --- |
| `COMMUNITY` | 일반 게시글 |
| `RESOURCE` | 첨부파일 있는 게시글 |
| `CONCERN_CARD` | **고민 카드 (신규)** |

> `postType`을 생략/null로 작성하면 일반 게시글(`COMMUNITY`)로 생성됩니다.
> 고민 카드로 생성된 글은 수정 시에도 타입 변경 불가입니다.

### 3.2 고민 카드 필드 (Post 최상위, flat)

| 필드 | 타입 | 작성 필수(백엔드) | 작성 필수(FE 강제) | 설명 |
| --- | --- | --- | --- | --- |
| `content` | string | O | O | 고민 본문(평문). 일반 글과 동일 필드 |
| `postType` | string | O | O | `"CONCERN_CARD"` 고정 |
| `therapyArea` | TherapyArea | X | O | 치료영역 · 단일 선택 (기존 enum 재사용) |
| `ageGroup` | AgeGroup | X | O | 연령대 · 단일 선택 (기존 enum 재사용) |
| `diagnoses` | string[] | X | O(1개 이상) | 진단명 · 자유 문자열 배열, **최대 10개·각 100자** |
| `otherNotes` | string | X | X(선택) | 기타 메모, **200자 이내** |
| `visibility` | Visibility | X | (기존 컨트롤) | 공개범위(기본 PUBLIC) |

> **필수 정책 차이**: 백엔드는 `content` 외 전부 optional입니다. 프론트는 구조화 데이터 품질을
> 위해 `therapyArea`/`ageGroup`/`diagnoses(≥1)`를 **UI에서 필수로 강제**합니다(기타만 선택).
> 프로토타입 반응을 보며 완화하기 쉬운 FE 단독 결정입니다.

`AgeGroup`은 **이미 `types/post.ts`에 정의된 enum을 재사용**합니다(휴면 타입). 사용자가 고른
6단계와 1:1 매칭됩니다. (`UNSPECIFIED`는 작성 칩에서 노출하지 않습니다. 라벨 매핑 상수는 신설.)

| enum 값 | 라벨 |
| --- | --- |
| `AGE_0_2` | 영아기 |
| `AGE_3_5` | 유아기 |
| `AGE_6_12` | 아동기 |
| `AGE_13_18` | 청소년기 |
| `AGE_19_64` | 성년기 |
| `AGE_65_PLUS` | 노령기 |

`therapyArea`는 기존 `TherapyArea` enum + `THERAPY_AREA_LABELS`/`THERAPY_CHIPS`를 재사용합니다
(`UNSPECIFIED` 제외).

### 3.3 응답 (읽기)

작성/수정/피드/상세 모두 **기존 엔드포인트** 사용. 응답에 위 flat 필드가 동봉됩니다.

- 작성: `POST /api/v1/posts` (기존 `createPost`. body에 `postType` 등 추가)
- 수정: `PATCH /api/v1/posts/{postId}` (postType 변경 불가)
- 피드 Summary: `ageGroup`/`diagnoses`/`otherNotes`/`therapyArea` 동봉 (Q2 = YES)
- 상세 Detail: `ageGroup`/`diagnoses`/`otherNotes` 동봉 (`therapyArea`는 기존부터 존재)

`fetchFeed`는 `res.data?.data ?? res.data`로, `fetchPost`는 `res.data`로 응답을 그대로 반환하므로,
**타입에 flat 필드를 추가하면 변환 없이 흐릅니다**(정규화 어댑터 불필요).

### 3.4 권한 마스킹 (신규)

| 역할 | `diagnoses` | `otherNotes` |
| --- | --- | --- |
| THERAPIST / ADMIN | 정상 노출 | 정상 노출 |
| USER(일반) | `null` | `null` |

- 프론트는 `diagnoses === null`이면 진단명 영역을 **"치료사 인증 후 확인 가능"** 안내로 대체합니다.
- `otherNotes === null`이면 기타 영역을 숨깁니다.
- `ageGroup`/`therapyArea`는 마스킹 대상이 아니며 항상 노출됩니다.

### 3.5 진단명 입력·정제 전략 (확정)
- PM이 제공한 자주 쓰이는 진단명 목록을 시드로 두고, 프론트에서 자동완성으로 유도합니다.
- **저장값은 정식 한글명으로 통일**합니다. 영문·이칭은 자동완성 검색 인덱스로만 사용합니다.
- 목록 내 진단명 = 표기 통일(정제 불필요). 목록 외(자유 입력) = 별도 수집 후 정제 대상.
- 백엔드 비용은 두 경우 모두 동일(자유 문자열 수신, 최대 10개·각 100자)하며, 목록 유도로
  데이터 품질만 향상됩니다.
- 동반진단(예: 자폐스펙트럼 + ADHD)을 고려해 복수 입력을 허용합니다.

#### PM 제공 시드 진단명 목록 (2026-05-27 수령, 22종)

출처: PM 공유 구글 시트 '기타 임상 정보'. 시드 상수 파일(`constants/concern.ts`)을 이 목록으로
생성합니다. 저장값 = 한글 진단명, 영문·이칭은 검색 인덱스(`aliases`)로만 사용합니다.

| 한글 진단명(저장값) | 영문 | 이칭(검색용) |
| --- | --- | --- |
| 자폐스펙트럼장애 | ASD | 오티즘, autism, 자폐증, 자폐성장애, 자폐 |
| 주의력결핍과잉행동장애 | ADHD | AD |
| 학습장애 | LD | |
| 뇌병변장애 | CP | 뇌성마비, 뇌병변 |
| 발달지연 | DD | |
| 언어지연 | | |
| 언어장애 | SLD, SD | |
| 지적장애 | ID, MR | |
| 경계선 지능 | BIF | 경계선, 느린 학습자 |
| 틱 장애 | tic disorder | 틱 |
| 뚜렛 증후군 | tourette syndrome | |
| 뇌전증 | epilepsy | 간질 |
| 다운증후군 | down syndrome | |
| 사시 | strabismus | |
| 취약 X 증후군 | fragile X syndrome | |
| 레트 증후군 | rett syndrome | |
| 윌리엄스 증후군 | williams syndrome | |
| 엔젤만 증후군 | angelman syndrome | |
| 선택적 함구증 | selective mutism | |
| 연하장애 | dysphagia | 삼킴장애 |
| 난독증 | dyslexia | 난독 |
| 사회적 의사소통장애 | SPCD | 사회성 떨어짐, 사회성 안좋음 |

### 3.6 백엔드 확정 답변 (구 미결 질문 해소)
1. ~~작성 엔드포인트 형태~~ → **기존 `POST /api/v1/posts`에 `postType: "CONCERN_CARD"` + flat 필드.**
2. ~~피드 응답 동봉 여부~~ → **Summary에 4필드 동봉됨.**
3. ~~진단명 배열 제약~~ → **최대 10개, 각 100자 이내.** (trim/중복 제거는 FE 처리)

남은 확인 2건(차단 아님, 검증 단계):
- `content`가 평문/HTML 중 무엇으로 저장·반환되는지(현 작성 흐름은 평문 전송). 상세 렌더 정합 확인.
- 백엔드 배포 시점(현재 staging/prod 미배포 = main 미머지 추정). 배포 후 staging E2E.

## 4. 작성 모달

- 상단에 "일반 글 / 고민 카드" 토글을 둡니다. 고민 카드 선택 시, 일반 본문 textarea 자리를
  고민 카드 폼이 대체합니다.
- 입력 순서: **고민 → 연령대 → 치료영역 → 진단명 → 기타**
- 고민: 본문 textarea. 제출 시 `content`로 전송.
- 연령대: 단일 선택 칩(영아기/유아기/아동기/청소년기/성년기/노령기). → `ageGroup`.
- 치료영역: 단일 선택 칩. 본인 치료영역을 선택하며, 라벨은 피드 필터칩과 동일합니다
  (감각통합/언어치료/작업치료/인지치료/물리치료/미술치료/음악치료/놀이치료/행동치료). → `therapyArea`.
- 진단명: PM 시드 목록 기반 **자동완성(커스텀 필터 드롭다운) + 자유 입력**.
  입력 후 Enter로 태그 추가, ✕로 제거, 복수 허용. **최대 10개, 각 100자**. → `diagnoses`.
- 기타: 유일한 선택(비필수) 항목. 부연 설명용. **200자 이내**. → `otherNotes`.
- 필수 검증(FE): 고민(비어 있지 않음), 연령대 선택, 치료영역 선택, 진단명 1개 이상. 기타는 선택.
- 칩·태그 선택 색상은 **무채색**(`bg-gray-900 text-white`)으로 기존 FilterChips 컨벤션을 따릅니다.
- 기존 공개범위(visibility) 컨트롤은 유지합니다.
- 첨부파일은 고민 카드에서 **미지원**(백엔드 향후 추가 예정)이므로 폼에 첨부 버튼을 두지 않습니다.

### 진단명 자동완성 구현 수준
- 시드 목록은 정적 클라이언트 상수(서버 호출/비동기 없음). 입력값으로 즉시 필터링합니다.
- 검색은 한글명 + 영문 + 이칭(`aliases`)을 모두 매칭하되, **추가되는 저장값은 한글명**입니다.
- 후보 드롭다운 클릭 또는 자유 입력 Enter로 태그를 추가합니다.
- 프로토타입 단계에서 키보드 화살표 탐색·ARIA 콤보박스는 생략 가능합니다(마우스/탭 클릭 + Enter로 충분).

## 5. 표시 (피드/상세 — B안, 완전 통일)

카드 내부 순서:
1. 카드 헤더: 아이콘 + "고민카드" 라벨
2. 메타: 연령대 / 치료영역 / 진단명(인라인 무채색 태그)
3. 구분선
4. "고민지점" 라벨 + 고민 본문(= `content` / 피드는 `contentPreview`)
5. 기타(`otherNotes`)는 입력된 경우에만 맨 아래 작게 표시

- 피드: 고민 본문에 `line-clamp-3` 적용 + "더보기"(기존 PostCard 패턴 재사용).
- 상세: clamp 해제, 전체 노출. 그 외 피드와 완전 동일한 카드.
- 작성자 헤더(아바타/닉네임/인증뱃지/시간)와 푸터(리액션/댓글/공유/북마크)는 기존 게시글과 동일합니다.
- **마스킹 표시**(3.4절): `diagnoses === null`이면 진단명 자리에 "치료사 인증 후 확인 가능",
  `otherNotes === null`이면 기타 숨김.
- 본문은 평문이므로 `whitespace-pre-wrap`로 기존 본문과 동일하게 렌더합니다(상세 렌더 정합은 검증 단계 확인).

## 6. 프론트 구현 경계 (flat — 변환 어댑터 없음)

타입(기존 Post 타입 확장):
- `PostType`에 `CONCERN_CARD` 추가.
- `PostSummary`·`PostDetail`에 `ageGroup?`, `diagnoses?: string[] | null`, `otherNotes?: string | null` 추가
  (`therapyArea`는 기존부터 존재).
- `PostCreateRequest`·`PostUpdateRequest`에 `postType?`, `ageGroup?`, `diagnoses?`, `otherNotes?` 추가.
- 별도 `Concern` 인터페이스/`ConcernCreateRequest` 중첩 타입은 **만들지 않습니다**(flat 직결).

신규 컴포넌트:
- `ConcernCard`: 피드/상세 공용 표시 컴포넌트. props `{ post, clamp? }`로 Post 필드를 직독.
- `ConcernForm`: 작성 폼(고민/연령대/치료영역/진단명/기타).
- `DiagnosisTagInput`: 자동완성 + 자유 입력 태그.
- `WriteTypeToggle`: 일반 글 / 고민 카드 토글.

상수: 연령대 칩/라벨 매핑, 진단명 시드 목록(aliases 포함)을 `constants/concern.ts`에 둡니다.

작성 API:
- `api/concerns.ts`에 얇은 `createConcern(input)` 헬퍼를 둡니다. 내부에서 flat `PostCreateRequest`를
  조립해 기존 `createPost`를 호출합니다. **변환 어댑터가 아니라 의미·검증용 래퍼**입니다
  (계약이 Post와 1:1이라 향후에도 변환 레이어는 불필요).

읽기 분기:
- `PostCard`/`PostDetailPage`에서 `postType === 'CONCERN_CARD'`이면 `ConcernCard`를 렌더합니다.

## 7. 테스트

- 환경은 MSW=false / staging 기반입니다. 백엔드 배포 후 staging에서 직접 검증합니다.
- 백엔드 독립 부분(폼 검증, 태그 입력, 카드 렌더, 마스킹 분기)은 로컬에서 목 데이터로 확인합니다.
- 테스트 러너(vitest/jest) 없음 → `npx tsc -b` + `npm run lint` + `npm run dev` 시각 확인.

## 8. 미결 사항

- `content` 평문/HTML 여부 + 상세 렌더 정합(검증 단계).
- 백엔드 배포 시점(현재 미배포).
- 피드/내 글 `postType` 필터 탭은 후속 백로그(2절 제외 범위).
