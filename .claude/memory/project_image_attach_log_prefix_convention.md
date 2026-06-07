---
name: project_image_attach_log_prefix_convention
description: "API 통신 실패 로깅 prefix 컨벤션 — [api-error] 광역 / [image-attach] 도메인, 단일 실패 2줄 의도적 중복"
metadata: 
  node_type: memory
  type: project
  originSessionId: e46840d8-0d58-410a-acd9-c91ce82d1c42
---

2026-05-28 `fd39c11`에서 정착한 통신 실패 콘솔 로깅 컨벤션. 향후 새 도메인 로깅 추가 시 동일 패턴 유지.

## 2계층 구조
- **`[api-error]`** (광역): `axiosInstance.ts` 응답 인터셉터에서 **모든 4xx/5xx + 네트워크 에러** 자동 로깅. 필드: `status, method, url, code, message, fieldErrors`. 401 자동 갱신 케이스는 노이즈 방지로 **비로깅**.
- **`[image-attach]`** (도메인 컨텍스트): 이미지 첨부 경로 한정. 변형 라벨로 발생 지점 분리:
  - `[image-attach] init 실패` — `posts.ts uploadOneAttachment` 안, initUpload throw 시
  - `[image-attach] 재시도 소진(S3 PUT/confirm)` — 3회 재시도 모두 실패 후 throw 직전
  - `[image-attach] {op} 호출부 실패({Page})` — PostWriteForm/PostEditPage catch에서 (uploadOneAttachment·deletePostImage·deletePostAttachment 4곳)
  - `[image-attach] 게시글 {작성|수정} 흐름 실패({Page})` — 외부 catch 2곳
  - 도메인 필드: `postId, kind, fileName, contentType, sizeBytes, status, code, message, err`

## 의도적 중복
단일 실패가 보통 **2줄** 찍힘(`[api-error]` 한 줄 + `[image-attach]` 한 줄). **원인 식별(광역)과 영향 식별(도메인)을 분리**하기 위함. 노이즈가 아니라 의도된 트레이싱.

## 새 도메인 추가 시 규칙
1. axios 인터셉터는 **손대지 말 것** — 광역 로깅 책임이 거기 단일 집중.
2. 새 도메인은 `[<domain>]` prefix로 호출부·서비스 함수 내부 catch에 추가.
3. 필드: 도메인 식별자(예: `postId`, `userId`) + 사람이 보기 쉬운 파라미터 + axios 에러에서 `status·code·message` 추출.
4. axios 에러 타입 단언: `as { response?: { status?: number; data?: { code?: string; message?: string } } }`.

**Why:** prefix 통일로 백엔드/QA가 콘솔 grep 가능. 광역+도메인 분리로 단일 실패의 트레이스가 두 시점에서 잡힘.
**How to apply:** 새 기능 catch에 로그 얹을 때 위 규칙대로. 컨벤션 깨고 싶으면 본 메모리부터 수정. [[project_image_attach_logging_ai_written_2026_05_28]] [[feedback_clarify_logging_intent_console_vs_remote]]
