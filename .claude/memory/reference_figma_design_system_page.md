---
name: 피그마 디자이너 컴포넌트 라이브러리 페이지
description: 시안 컴포넌트 + variant 정의된 피그마 디자인 시스템 페이지 진입점 + 아이콘 노드 ID 매핑
type: reference
originSessionId: a595a01c-bbfb-4ba3-94cc-d340da6e58c4
---
# 피그마 디자인 시스템 페이지

디자이너가 시안 전체에서 사용하는 컴포넌트를 한 페이지에 정리해둔 디자인 시스템. 아이콘/Header/Post/Button 등 모든 컴포넌트가 on/off variant까지 정의됨.

- 파일: `nrgNkAzEjhSC74GzrVfMBG` (멜로미)
- 페이지 노드: **`1321:5320`** ("컴포넌트" 섹션)
- URL: `https://www.figma.com/design/nrgNkAzEjhSC74GzrVfMBG/멜로미?node-id=1321-5320&m=dev`

## 용도

- 시안 아이콘/컴포넌트 노드 ID 빠르게 찾기
- 디자이너가 정의한 variant(on/off 등) 구조 확인
- 새 아이콘 export 작업 시 진입점

## nav 아이콘 노드 ID 매핑 (2026-05-11 사이드바 작업 시 확인)

| 아이콘 | on (활성) | off (비활성) |
|---|---|---|
| home | `1278:2779` | `1278:2778` |
| search (such) | `1278:2780` | `1278:2782` |
| post (글쓰기) | `1278:2781` | `1278:2784` |
| bell | `975:3235` | `1278:2777` |
| my (프로필) | `1278:2783` | `1278:2785` |
| option (케밥) | `1498:25756` (기본) | — |

각 variant는 부모 frame 안에 정의 — 예: `icon_nav_home`(1278:2786) frame 안에 on/off 2개.

## Figma 플랜 한계

사용자 계정은 **Figma Education plan** — MCP 호출 횟수에 limit이 있어 rate limit에 걸린 이력 있음. 한 세션에서 무분별한 `get_screenshot`/`get_design_context` 호출 자제, 필요한 노드만 정확히 조회.
