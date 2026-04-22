#!/usr/bin/env python3
"""UserPromptSubmit hook: detect Windows paths (drag-and-drop) and
inject WSL-converted paths as additionalContext."""
import sys
import json
import re
import subprocess

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

prompt = data.get("prompt") or ""
if not prompt:
    sys.exit(0)

# Quoted: "C:\Path With Spaces\file.ext"
# Unquoted: C:\Path\no\spaces.ext  (stops at whitespace/quote/shell-reserved chars)
pattern = re.compile(
    r'"([A-Za-z]:\\[^"]+)"'
    r'|(?<![A-Za-z"/])([A-Za-z]:\\[^\s"<>|?*]+)'
)

seen = []
for m in pattern.finditer(prompt):
    p = m.group(1) or m.group(2)
    if p and p not in seen:
        seen.append(p)

if not seen:
    sys.exit(0)

mappings = []
for p in seen:
    try:
        r = subprocess.run(
            ["wslpath", p], capture_output=True, text=True, timeout=5
        )
        if r.returncode == 0:
            wsl = r.stdout.strip()
            if wsl and wsl != p:
                mappings.append(f"  {p}\n  → {wsl}")
    except Exception:
        pass

if not mappings:
    sys.exit(0)

context = (
    "[WSL path auto-convert] Windows 경로 감지됨. 아래 WSL 경로로 읽으세요 "
    "(Read/Bash 등 툴 호출 시 변환된 경로 사용):\n\n"
    + "\n\n".join(mappings)
)

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "UserPromptSubmit",
        "additionalContext": context,
    }
}, ensure_ascii=False))
