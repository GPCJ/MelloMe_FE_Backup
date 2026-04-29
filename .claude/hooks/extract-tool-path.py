"""hook 입력 JSON에서 file_path 또는 notebook_path를 추출해 stdout에 출력."""
import json
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    print("")
    sys.exit(0)

tool_input = data.get("tool_input", {})
print(tool_input.get("file_path") or tool_input.get("notebook_path") or "")
