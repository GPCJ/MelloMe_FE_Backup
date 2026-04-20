---
name: Stop Hook - 터미널 벨
description: 사용자 요청으로 ~/.claude/settings.json에 Stop hook(printf '\a')을 추가하여 답변 완료 시 터미널 벨을 울리도록 설정함
type: project
originSessionId: 2739f75f-619a-4b90-9792-1fe1fb400967
---
사용자는 Claude 답변 완료 시 알림 벨이 울리기를 원하며, 2026-04-20에 user global `~/.claude/settings.json`에 Stop hook을 추가함 (command: `printf '\a'`).

**Why:** WSL2 환경에서 답변 완료 타이밍을 소리로 알림받고 싶어함. 터미널 벨 방식을 선호 (ASCII bell, 별도 설치 불필요).

**How to apply:**
- 이후 Hook 관련 설정 요청 시 user global 설정 파일을 선호하는 경향 참고
- 벨이 안 울린다는 피드백이 오면 Windows Terminal의 Bell notification 설정을 먼저 확인하도록 안내
- 설정 파일이 새로 생성된 직후에는 `/hooks` 재열기 또는 재시작이 필요할 수 있음
