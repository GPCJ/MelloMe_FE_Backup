---
name: project-postcard-attachment-chip-pending
description: PostCard 첨부 개수/파일명 — 목록 API `TherapyPostSummaryResponse.attachments` 필드 대기 (2026-05-12)
metadata: 
  node_type: memory
  type: project
  originSessionId: 2d3bc8cc-a543-4e3e-9113-ef432a2b427b
---

PostCard에 첨부 칩 UI 작업이 **백엔드 의존으로 대기 중** (2026-05-12).

**합의 스코프 (백엔드 + 디자이너 정렬 완료)**
- 표시 요소: 이미지 미리보기(완료) + **첨부된 파일 숫자** + **지금처럼 첨부파일 리스트 최선두 파일명**
- 동작: 표시만 (클릭 시 다운로드 X, 카드 클릭과 동일하게 상세 페이지 진입)
- 이유: 카드 전체가 `<Link>`로 감싸진 구조라 무효 HTML 회피 + 단순화

**필요 백엔드 작업**
- `TherapyPostSummaryResponse`에 `attachments: AttachmentResponse[]` 추가 요청
- 스키마는 `PostDetail.attachments`와 동일 권장 (`id`, `originalFilename`, `contentType`, `sizeBytes`, `extension`, `downloadUrl`, `createdAt`)
- 프론트는 `.length` (개수) + `[0].originalFilename` (첫 파일명)만 사용

**프론트 후속 작업 (백엔드 머지 후 착수)**
- `PostSummary` 타입에 `attachments?: Attachment[]` 추가
- PostCard에 칩 블록 추가 — 캐러셀 아래, 기존 "첨부파일 있음" 텍스트 자리 대체
- 칩 디자인: 회색 pill (`<Download size={18}/>` + 개수) + 첫 파일명 텍스트 (PostDetailPage 칩 컨벤션 축약 버전)
- 가드: `post.attachments && post.attachments.length > 0`
- 가독성 위해 `hasAttachment` 텍스트 fallback 제거 가능 (`attachments` 도입 후)

**Why**: MVP D-3 마감 + 백엔드/디자이너 공식 합의 후 진입. 이미지 캐러셀과 분리한 이유 — 백엔드 의존 차이로 머지 타이밍 분리.

**How to apply**: 백엔드에서 `attachments` 추가 머지되면 notepad 2순위 작업 착수. 칩 자체 클릭 핸들러는 추가하지 말 것(표시만). 무효 HTML(`<button>` in `<a>`) 회피.

**관련**
- [[project-postcard-image-carousel-2026-05-12]] — 같은 PR로 진행한 이미지 캐러셀 (완료분)
- wiki `link-dragstart-bubbling-postcard-2026-05-12` — Link 안 인터랙션 함정 박제
- [[reference-swagger-staging]] — 백엔드 머지 확인용 staging swagger
