---
name: user_cursor_heavy_prefer_direct_edits
description: "code . = Cursor 실행이라 무거움 → 작은 로컬 편집(.env 등)은 '에디터에서 여세요' 말고 내가 직접"
metadata: 
  node_type: memory
  type: user
  originSessionId: 16ae526c-c423-4b51-b754-8be354c49bde
---

사용자 환경에서 `code .`은 **Cursor를 실행**하는데 무거워서 여는 걸 꺼린다.

**How to apply:** 작은 로컬 파일 편집(`.env`/`.env.local` 플립, 설정값 토글 등)을 "에디터에서 직접 여세요"라고 안내하지 말고, **내가 Edit 도구로 직접 편집**해준다(gitignored/로컬 설정이면 특히). 2026-07-03 `.env.local`의 `VITE_MSW_ENABLED` 플립을 이 이유로 내가 대신 처리함. dev 서버 실행 등 사용자가 직접 해야 하는 건 그대로 사용자 몫.
