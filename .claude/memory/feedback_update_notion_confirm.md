---
name: /update-notion 실행 시 초안 먼저 확인
description: 노션 업데이트 전 채팅창에 초안 보여주고 사용자 승인 후 업로드할 것
type: feedback
---

`/update-notion` 실행 시 노션에 바로 올리지 않고, 채팅창에 초안을 먼저 보여준 뒤 사용자 승인 후 업로드할 것.

**Why:** Claude가 작성한 내용과 실제 개발 현황이 다를 수 있어서, 사용자가 매번 노션에 직접 들어가 확인하는 게 번거로움.

**How to apply:** `/update-notion` 커맨드 실행 시 항상 "현재 진행 중 변경사항 / 주간 기록 추가 항목" 초안을 먼저 출력하고, 승인("ㅇㅇ", "ok" 등) 받은 후에 notion-update-page 호출.
