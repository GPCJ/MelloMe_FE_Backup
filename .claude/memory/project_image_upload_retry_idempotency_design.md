---
name: project_image_upload_retry_idempotency_design
description: "이미지 업로드 재시도/멱등 설계 — storedKey 재활용·이미지 한정. 만료 폴백 배제는 2026-05-28 stale 처리(백엔드 핸드오프 이슈 #11로 도입 예정)."
metadata: 
  node_type: memory
  type: project
  originSessionId: 20104ef0-2058-4a4e-9469-fdd41c68174e
---

백엔드 DM으로 재시도 도입 전 멱등 키 계약을 맞춘 결과 (2026-05-25). 미뤘던 "이미지 로깅 + 재시도" 트랙.

## 합의된 설계 (지금 구현)
- **멱등 키 = `storedKey`** (init 응답 발급, S3 객체 경로). 3단계: init → S3 PUT → confirm (`api/posts.ts:162~178`, `types/post.ts:168~191`).
- **재시도는 init 제외, PUT/confirm만.** init은 1회 → storedKey 고정 → 백엔드가 중복 confirm을 멱등 처리 가능.
- **⚠️ storedKey 보관 위치는 자동/수동 재시도 결정에 종속 (미결정, 내일 갈림길):**
  - **자동 재시도**(in-함수 루프) → init 재호출 안 하니 storedKey는 **지역 `const`로 충분, ref 불필요.**
  - **수동 재시도**(사용자 버튼) → 함수 경계 넘으므로 **ref/state 필요**(= "현재 유효한 최신 storedKey", 재발급 시 덮어씀).
  - (저번 "ref에 보관" 결론은 재시도가 함수 경계를 넘는다는 가정이었음 → 자동이면 틀림. localStorage는 resume 기능용이라 MVP 밖.)
- **적용 범위 = 이미지만.** PDF는 구식 multipart 엔드포인트(`/attachments`)라 흐름 별개.

## ⚠️ 2026-05-28 결정 뒤집힘 — 만료 폴백 도입 예정
- **계기:** 백엔드 핸드오프 이슈 #11 섹션 2 (https://github.com/AIRO-offical/therapist_community_FE/issues/11). 백엔드 명시 요구: "presigned URL 만료(보통 5분, 403 expired)일 때만 init 재발급".
- **원래 배제 이유(stale):** YAGNI — 정상 PUT은 수 초, 5분 TTL을 능동 재시도가 칠 일 거의 없다고 봤음. 모바일 장기 단절(지하철/엘리베이터) 케이스는 박제만 해뒀음.
- **뒤집은 이유:** 백엔드가 멱등/재시도 계약을 명시적으로 요청. 우리가 만료 폴백을 안 하면 모바일 장기 단절 케이스에서 영구 실패 + 백엔드 로그에도 안 남음. 백엔드 보장(`UPLOAD_409_CONFIRM` race·confirm 멱등)과 묶음으로 받기.
- **채택 구현 = 안 B (PUT/confirm 두 try-catch 분리):**
  - PUT catch에서 403만 → init 1회 재호출 → uploadUrl/storedKey 덮어쓰고 즉시 재시도(delay 생략)
  - confirm catch는 별도 — Step 3(409 race)도 같은 자리에 자연스럽게 붙음
  - re-init은 1회만 허용 (`reInitDone` 플래그)
- **이전 박제와의 정합:** "PUT 실패 catch에서 만료면 → init 1회 재호출 → 새 storedKey 덮어쓰기 → PUT 재시도, 선제적 expiresAt 계산 말고 반응형(S3 응답 기준)" — 그대로 채택. ref 대신 함수 내 변수(자동 재시도라 경계 안).

## 진행 상태 — ✅ 구현 완료 (2026-05-26, commit `e7ea9bb`, develop)
- 갈림길 결정: **자동 재시도** 채택(in-함수 루프) → storedKey는 **지역 const**(ref 불필요, 함수 경계 안). + **공용 헬퍼 추출** 채택.
- `posts.ts`에 `uploadOneAttachment(postId, pf, {maxAttempts=3})` 신설: init 1회(루프 밖, storedKey 고정) → for 루프 안에서 PUT+confirm만 try, 성공=return / 마지막 실패=throw / 그 외=`console.warn` 진단 로깅 후 `delay(attempt===1?500:1000)` 점증 backoff.
- `PostWriteForm`/`PostEditPage` 중복 3단계 블록 → 헬퍼 호출 한 줄로 수렴.
- **검증 완료**: staging(MSW off)에서 DevTools Request blocking으로 S3 PUT(`*melonne-therapists-bucket-dev.s3*`, URLPattern 문법) 강제 차단 → `[upload] 재시도` attempt 1·2 로그 + 0.5s/1s 간격 + 최종 실패 alert 확인. 해피패스도 정상.
- **사용자 직접 작성**(직접 코딩 모드) → AI 인지부채 메모리 불요. 학습: console.warn/Promise+setTimeout(delay)/재시도 루프 2출구(return·throw) 처음 체화.
- 만료 폴백은 합의대로 미구현(배제). 백엔드 presigned TTL 값은 여전히 미확인.

## 2단계 — 만료 폴백 + 409 race 도입 (2026-05-28~ 진행 중, 안 B)
- 트리거: 이슈 #11 섹션 2 + backend handoff 섹션 8.
- 작업 범위: `uploadOneAttachment` 한 함수만(`api/posts.ts:183~260`), 호출부 영향 없음.
- 변경 골자: PUT/confirm 분리 try-catch + PUT 403 한정 init 1회 재발급 + confirm 409 같은 storedKey 재시도.
- 예상 추가량 ~20~25줄 (현재 ~67줄 → ~90줄).
- 작성 주체: **본인 직접**(새 로직, [[feedback-direct-coding-default]] 적용).

### 1차 구현 시도(2026-05-28) — 위치 오류, 미커밋
- 403 재발급 if 블록을 **잘못된 catch에 배치**: PUT/confirm catch가 아닌 **init catch(`posts.ts:201~224`)** 안에 넣음.
- 부가 문제: 재발급한 새 `uploadUrl`/`storedKey`가 직후 `223`줄 `throw err`로 즉시 버려져 실효성 0. for 루프에 닿지 못함.
- 원인 추정: "만료 403"이 어느 단계에서 발생하는지 한 번 혼동 — 우리 백엔드 init POST가 아닌 **S3 PUT(`228`줄 `uploadToS3`)** 에서 발생함. init 호출에서 떨어지는 403은 인증/권한 문제로 무관.
- 학습 포인트: axios 기반 호출은 실패 시 **반환값이 아니라 throw 객체**를 본다(`err.response.status`).

### 재개점 (다음 세션, 순서대로)
1. `posts.ts:203~212`의 if 블록 **잘라내서** PUT/confirm catch(`235~258`) 안으로 이동 — 위치는 `e` 캐스팅 다음, `attempt === maxAttempts` 분기 이전.
2. init catch(`201~224`)는 수정 전(로깅+`throw err`만) 원상 복구.
3. `reInitDone` 플래그를 for 루프 **바깥**(예: `225`줄 근처) `let reInitDone = false;`로 선언. if 조건을 `e?.response?.status === 403 && !reInitDone`으로 + 재발급 후 `reInitDone = true;`.
4. 재발급 직후 `continue;` 추가 — `maxAttempts` 분기·`delay`를 건너뛰고 다음 attempt에서 새 URL로 즉시 재시도.
5. 만료 분기 진단 로깅: `console.warn('[image-attach] presigned expired, re-init', { postId, fileName: pf.file.name, attempt });`.

### 결정 이력: 안 A vs 안 B
- 안 A(최소, ~10~12줄): 한 catch 안에서 status 403 감지. 단점 — confirm 단계 403도 PUT 만료로 오해할 위험.
- **안 B(채택, ~20~25줄):** PUT/confirm 두 try-catch 분리. 이유 — Step 3(confirm 409 race)도 같은 분리 구조 위에 한 줄 얹기로 끝나서 두 번 일 안 함.

**Why:** 멱등을 백엔드가 storedKey로 보장하면 FE는 confirm 중복 재시도를 안심하고 할 수 있음. 만료 폴백은 희귀 엣지라 박제만 해두면 인지부채 없이 나중 회복 쉬움.
**How to apply:** FE 재시도 구현 시 init 재호출 금지(만료 폴백 제외). storedKey 보관 위치는 자동/수동 결정 후 확정(자동=지역 const, 수동=ref). silent 누락 버그는 [[project_image_attach_decode_guard_2026_05_23]] 별 트랙.
