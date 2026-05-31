---
name: project_image_attach_logging_ai_written_2026_05_28
description: "이미지 첨부 통신 실패 로깅 9곳 AI 전체 작성 — 인지부채 HIGH, 본인 검토·커밋 전 단계, prod init 500 컨텍스트 캡처 목적"
metadata: 
  node_type: memory
  type: project
  originSessionId: e46840d8-0d58-410a-acd9-c91ce82d1c42
---

2026-05-28, 백엔드 요청("이미지 첨부 4xx~5xx 다 로깅")에 응답해 옵션 C(axios 인터셉터 + image-attach 경로) 적용. **9곳 전부 AI 작성, 본인 직접 작성 0**. 컨디션상 본인 작성 못 한 상태로 위임.

## 적용 파일 4개·로그 9곳
1. `axiosInstance.ts:54~72` — `[api-error]` / `[api-error] network/no-response` (모든 4xx/5xx + 네트워크 에러, 401 갱신 제외)
2~3. `posts.ts uploadOneAttachment` — `[image-attach] init 실패` (init throw), `[image-attach] 재시도 소진(S3 PUT/confirm)` (3회 소진 후 throw)
4~5. `PostWriteForm.tsx` — uploadOneAttachment catch + 외부 catch
6~9. `PostEditPage.tsx` — deletePostAttachment / deletePostImage / uploadOneAttachment catch + 외부 catch

## 설계 의도 (AI가 결정한 것들, 본인 확인 필요)
- **2계층 prefix**: `[api-error]`=광역, `[image-attach]`=도메인 컨텍스트. 단일 실패가 보통 2줄 찍힘(의도적 중복, 원인+영향 분리).
- **401 자동 갱신 케이스는 비로깅** (성공 경로 노이즈 방지).
- **재시도 로직 자체엔 손대지 않음** (백엔드 인수인계 대기, [[project_prod_init_upload_500_2026_05_28]]).
- err 객체에서 status/code/message 추출 시 `as { response?: { status?: number; data?: { code?: string; message?: string } } }` 타입 단언 — axios 에러 객체 형태 의존.

## 인지부채 풀기 (해야 할 것)
1. `git diff` 9곳 직접 훑기 — 위치·prefix·캡처 필드 본인이 이해
2. dev 환경에서 일부러 실패 일으켜 콘솔에 두 줄 뜨는지 본인 눈으로 확인
3. axios 에러 객체 구조(`error.response.data.{code,message,fieldErrors}`) 본인이 한 번 디버거로 확인 — 단언이 실제 형태와 맞는지
4. 본인이 이해 후 커밋 (AI 적용 상태로 직접 커밋 금지)

## 의도적으로 안 한 것
- dead code `uploadPostImage` 삭제 (별도 의도라 분리)
- 원격 에러 수집(Sentry 등) — 콘솔만, 백엔드 직접 영향 X 확인됨
- 커밋 — 워킹트리만 남김

**Why:** prod init 500이 일어났을 때 콘솔에 status·code·message·페이로드 메타가 한 줄로 박혀 백엔드 협업 자료가 즉시 생기게.
**How to apply:** 위 인지부채 4단계 완료 전엔 검증된 코드 아님. 본인 손이 닿은 뒤 커밋·운영 반영. [[feedback_ai_written_code_cognitive_debt]] [[feedback_direct_coding_default]]
