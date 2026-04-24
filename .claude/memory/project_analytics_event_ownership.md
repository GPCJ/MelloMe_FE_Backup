---
name: 분석 이벤트 설계 오너는 PM
description: GA4/Clarity 이벤트 설계는 PM 담당, 프론트는 PM 설계안 기반으로 삽입만 수행
type: project
originSessionId: a346a2da-92cb-4aef-a851-d9542fa6004a
---
GA4/Clarity 커스텀 이벤트의 **설계(어떤 이벤트를/언제/어떤 파라미터로 보낼지)는 PM이 소유**한다. 프론트 개발자(사용자)는 PM 설계안을 받아 삽입만 수행.

**Why:** 2026-04-24 deep-interview에서 사용자가 명시. "어떤 이벤트를 수집하고 싶은지는 PM이 설계할 것이라서 일단 지금은 내가 선택한 이벤트만 수집하고 추후에 PM이 설계안을 주면 그것을 추가 도입할거야."

**How to apply:**
- "어떤 이벤트를 추적할까요?" 같은 질문은 PM-설계 영역으로 가정하고 사용자에게 직접 설계 요구하지 말 것
- 이번(2026-04-24) 범위로 확정된 이벤트 4개: `signup_completed`, `verification_requested`, `first_post_created`, `login_completed` — 전부 **익명(user_id 미부착)**, client_id만 사용
- 향후 PM 설계안이 도착하면 그때 추가 이벤트 논의
- 이벤트 삭제/변경도 PM 합의 필요
