---
name: 피그마 아이콘 SVG 추출 워크플로우 + MCP 한계
description: 피그마 아이콘을 React 컴포넌트로 가져올 때의 표준 절차, MCP raster 한계, 노드 깊이 트랩
type: feedback
originSessionId: a595a01c-bbfb-4ba3-94cc-d340da6e58c4
---
# 피그마 아이콘 SVG 추출 워크플로우

피그마 시안 아이콘을 프론트에 가져올 때 항상 같은 순서로 처리. 2026-05-11 사이드바 6개 작업에서 정립.

## 표준 순서

1. 디자이너 컴포넌트 라이브러리 페이지(`reference_figma_design_system_page`)에서 노드 ID 찾기
2. **사용자가 피그마에서 직접 SVG export** (MCP 자동 추출 불가, 아래 한계 참조)
3. 받은 SVG 구조 확인 — viewBox 24×24 / `fill="none"` / stroke 또는 fill 색 확인
4. `stroke="..."` / `fill="..."` 색 값을 `currentColor`로 치환(svg 루트 `fill="none"`은 유지)
5. React 컴포넌트화: viewBox 고정 + size prop + SVGProps forward + 학습용 주석
6. 사용처 import 1줄 교체

## Why — MCP raster 한계

피그마 MCP의 `get_design_context`는 SVG raw를 안 주고 **여러 `<img>` 레이어를 absolute positioning으로 합친 raster 자산**으로 반환함(`mcp/asset/...` URL, 7일 만료). 이걸 그대로 쓰면:
- 7일 후 URL 만료로 깨짐
- `currentColor` 색 제어 불가
- 크기 조절 시 흐려짐

→ 자동 추출 의존 금지, 사용자 직접 export가 표준.

## How to apply — 트랩 회피

### 트랩 1: 노드 깊이 (24×24 vs 60×60)

피그마는 아이콘 본체(24×24) 바깥에 슬롯 박스(60×60 등)로 한 번 더 감싸는 구조가 흔함. 사용자가 바깥 박스를 통째로 export하면 24×24 박스에서 8px로 쪼그라듦.

안전장치: export 직전 피그마 우측 패널의 selection 크기가 **`24 × 24`** 인지 확인. 60×60이면 한 단계 더 안쪽으로.

2026-05-11 more.svg 사례 — 60×60 슬롯 export → 진짜 아이콘이 중앙 20×20 영역에만 존재 → 24×24로 렌더 시 점이 너무 작아짐 → 사용자가 lucide 유지 결정으로 우회.

### 트랩 2: on/off variant — 모양 같은지 다른지 먼저 확인

디자이너가 같은 아이콘을 on/off 두 variant로 만들어두는 경우가 있음. 두 시나리오:
- **시나리오 A**: 모양 동일, 색만 다름(`#000` ↔ `#99A1AF`) → `currentColor` 단일 SVG로 충분, 부모 `text-*`로 색만 전환
- **시나리오 B**: 모양 자체가 다름(outline ↔ fill, 굵기 등) → 컴포넌트가 active prop으로 분기, SVG 2개 필요

판별 방법: 임의의 2쌍 spot-check(스크린샷 비교). 2026-05-11 사이드바는 시나리오 A 확정.

### 트랩 3: ProfileIcon 류 — fill + stroke 혼합

마스코트형 아이콘은 한 SVG 안에 `fill` 영역(코·눈)과 `stroke` 영역(입 곡선)이 섞여 있음. 두 곳 모두 `currentColor`로 치환해야 단일 색으로 통일됨. svg 루트 `fill="none"`은 유지.

### 트랩 4: JSX 변환

`stroke-width` → `strokeWidth`, `stroke-linecap` → `strokeLinecap`, `stroke-linejoin` → `strokeLinejoin`. `xmlns`는 생략 가능(React 자동 추가).

## 검증

- typecheck(`tsc -b`) 후 dev 서버 시각 확인
- active(`text-gray-900` 검정) / inactive(`text-gray-400` 회색) 전환 동작 확인
