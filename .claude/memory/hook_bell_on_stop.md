---
name: Stop Hook - Windows 토스트 + 시스템 사운드
description: ~/.claude/settings.json Stop hook이 PowerShell로 Windows 시스템 사운드 + NotifyIcon 토스트를 쏨 (2026-04-22, 기존 터미널 벨에서 교체)
type: project
originSessionId: 2739f75f-619a-4b90-9792-1fe1fb400967
---
사용자는 Claude 답변 완료 시 소리+시각 알림을 원하며, 2026-04-22에 user global `~/.claude/settings.json`의 Stop hook을 PowerShell 기반으로 교체함. 기존 `printf '\a'` 방식은 Windows Terminal의 bell 설정 때문에 소리가 안 울려서 폐기.

현재 command (줄 길어서 구조만 기록):
- `(powershell.exe -NoProfile -WindowStyle Hidden -Command '<PS script>' >/dev/null 2>&1 &)` — 서브셸+백그라운드로 hook 즉시 리턴 (지연 0)
- PS 내용: `[System.Media.SystemSounds]::Asterisk.Play()` + `System.Windows.Forms.NotifyIcon.ShowBalloonTip(3000, "Claude Code", "응답 완료", "Info")` + 3초 후 Dispose

**Why:** WSL2+Windows Terminal 환경에서 `printf '\a'`가 Windows Terminal bell 설정에 의존해 소리 안 나는 이슈가 있었음. PowerShell 경유로 Windows 시스템 사운드+토스트 쏘면 터미널 설정과 무관하게 확실히 알림이 감. 사용자가 2026-04-22 A/B(Windows Terminal 설정 변경 vs PowerShell hook) 중 B 선택.

**How to apply:**
- 설정 파일은 user global (`~/.claude/settings.json`), Mac에는 동기화 안 됨
- 편집 후 현재 세션 반영은 `/hooks` 한 번 열었다 닫기 또는 Claude Code 재시작 필요
- Edit 툴은 self-modification 보호로 차단됨 → `update-config` 스킬 통해 우회
- `powershell.exe`는 `/mnt/c/WINDOWS/System32/WindowsPowerShell/v1.0/powershell.exe` 경로에 있음, PATH에서 자동 인식됨
- 추후 알림음/메시지 변경 시 `[System.Media.SystemSounds]::<name>.Play()` (Asterisk/Beep/Exclamation/Hand/Question) 혹은 `ShowBalloonTip` 인자 수정
