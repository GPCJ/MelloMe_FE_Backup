---
name: Figma MCP 워크어라운드
description: Figma MCP가 세션에서 로드 안 될 때 REST API로 대체하는 방법
type: project
---

Figma MCP(`figma-developer-mcp`)가 `~/.claude.json`에 설정돼 있어도 세션 시작 시 로드되지 않는 경우가 있음.

**Why:** Claude Code 재시작 이후에도 MCP 서버가 활성화되지 않는 버그 추정.

**How to apply:** MCP 툴이 없으면 Figma REST API로 직접 호출:

```bash
# 노드 구조 확인
curl -s -H "X-Figma-Token: <API_KEY>" \
  "https://api.figma.com/v1/files/<FILE_KEY>/nodes?ids=<NODE_ID>"

# API Key 위치: ~/.claude.json > projects > /Users/jin/my-project > mcpServers > figma > args
# 멜로미 파일 키: nrgNkAzEjhSC74GzrVfMBG
# 디자인 섹션 node: 269-682
```

python3로 파싱해서 트리 구조, 색상, 텍스트 추출 가능.
