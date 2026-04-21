---
name: 장기 참고문서는 OMC wiki로, auto-memory는 hot index만
description: 50줄 이상 긴 참고/아카이브/학습 문서는 OMC wiki에 넣고, auto-memory는 짧은 hook/규약/실시간 상태만. 토큰 효율 개선용 규약.
type: feedback
originSessionId: 9d5213dd-6bac-4fb6-9496-166da9830a4b
---
장기 참고문서는 **OMC wiki** (`wiki_ingest`/`wiki_query`)로, `~/.claude/projects/.../memory/` 하위 auto-memory는 **짧은 hook + 규약 + 진행 중 상태**만 유지.

**Why:**
- auto-memory의 MEMORY.md는 매 세션 컨텍스트에 자동 로드됨 → 긴 파일이 인덱싱되면 그 hook 줄까지 고정 비용
- 더 큰 비용은 "내용이 필요할 때 파일 전체 Read"에서 발생 (60~160줄 단위). wiki는 `wiki_query`로 매칭 스니펫만 반환
- 2026-04-22 세션에서 12개 파일(~900줄) 이관 + 검증 완료. MEMORY.md 자체 크기는 거의 불변이지만 "필요 시 부분 로드" 효과 확보

**How to apply:**
- **wiki로 보낼 것**: 50줄 이상 reference/architecture/decision/debugging/session-log/pattern/convention, 완료된 아카이브 (월별 회고, 삭제 내역, 정리 작업 로그), 긴 학습 정리
- **auto-memory에 남길 것**: 사용자 프로필, feedback(행동 규약), 활성 project 상태(진행 중/블로킹 대기), 짧은 핵심 정책, 외부 시스템 reference (포인터 URL 등)
- **이관 절차**: (1) `wiki_ingest`로 title/category/tags 지정해서 등록 (2) MEMORY.md 색인을 `→ wiki <slug>` 형태로 교체 (3) 다른 파일의 참조도 wiki slug로 리다이렉트 (4) 원본은 당분간 dormant 유지 (삭제는 별도 승인 필요)
- **카테고리 매핑**: architecture/decision/pattern/debugging/environment/session-log/reference/convention 중 선택
- **위치**: 지금도 여러 세션에서 같은 "긴 문서 수정" 유혹이 있으면 이 규약 떠올리고 wiki에 쓸지 먼저 판단

**안 해도 되는 경우**:
- 50줄 미만 짧은 메모
- 자주 수정되는 활성 진행 상태 (wiki는 append 전략이라 update가 번거로움)
- 민감/비밀 정보
