---
name: project_more_button_color_temp
description: "피드 \"더 보기\" 버튼 임시 파란색 — 디자이너 시안 확정 전 본문 회색과 구분용, 줄바꿈 작업 시 재검토"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1cf83677-c6a3-467b-a2a5-e78b314f170e
---

피드 PostCard의 "더 보기" 버튼(`frontend/src/components/post/PostCard.tsx:144`)이 본문 텍스트(`text-gray-600`)와 거의 같은 회색(`text-gray-500`)이라 본문인지 더보기인지 구분이 안 되는 문제. 2026-05-20 사용자 결정:

- **임시로 파란색**(`text-blue-600 hover:text-blue-700` 등)으로 fix해 본문과 구분.
- **디자이너의 정확한 시안이 나오면 그때 색/스타일 재수정** — 지금 색은 placeholder.

**왜:** 더보기 기능(commit `2d854a8`)에서 색 정의를 따로 안 해 본문과 동화됨. 정식 디자인 토큰/시안 부재.

**How to apply:** 추후 [[project_post_content_preview_newline_pending]] 줄바꿈 관련 작업을 다룰 때 이 임시 색도 함께 디자이너 시안으로 교체할 것. 코드는 사용자가 직접 작성.
