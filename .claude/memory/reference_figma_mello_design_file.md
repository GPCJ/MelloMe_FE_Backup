---
name: 멜로미 figma 디자인 파일 fileKey + 주요 nodeId 인덱스
description: 시안 작업 시 figma URL 재수령 없이 바로 진입할 수 있도록 fileKey와 자주 쓰는 nodeId 박제
type: reference
originSessionId: 64496510-38fc-46a9-8da2-ac745930f64d
---
# 멜로미 figma 디자인 파일

- **fileKey**: `nrgNkAzEjhSC74GzrVfMBG`
- 전체 URL 패턴: `https://www.figma.com/design/nrgNkAzEjhSC74GzrVfMBG/멜로미?node-id=<NODE_ID>`
- Figma MCP tool 호출 시 nodeId 포맷: `1387:11788` (URL의 `1387-11788`을 `:`로 변환)

## 자주 쓰는 nodeId 인덱스 (2026-05-11 기준)

### 게시글 상세 (PostDetailPage)

- **PC 전체**: `1387:11788` — 홈 피드 PC 700~
- **PC 헤더 (header_sub)**: `1387:12278` — 좌측 백버튼 + 절대중앙 "게시글" 18px medium + 우측 96px 자리
- **PC 게시글 본문 카드 (post_detail)**: `1387:12297` — 작성자/본문/이미지/첨부/리액션 행
- **PC 댓글 리스트 (Reply_list)**: `1387:13250` — 댓글/대댓글 평면 + 꺾인 선(╰) prefix 패턴

### 메인 피드 (PostListPage)

- **모바일 전체**: `1321:3821`
- **모바일 헤더 (header_main)**: `1321:3823` — 좌측 햄버거 (px-[16px] + 24px 아이콘) + 정중앙 "mellty" 로고 32px
- **모바일 post_feed**: `1321:3827`, `1321:3828`

## 사용 가이드

- 같은 시안 파일을 반복 참조하는 작업에서 사용자에게 figma URL 다시 받지 말 것 — fileKey는 이 파일에 박제됨
- 새 nodeId만 받아서 `mcp__claude_ai_Figma__get_design_context` 호출에 fileKey와 함께 전달
- 새 작업에서 자주 쓰는 nodeId 발견 시 위 인덱스에 추가
