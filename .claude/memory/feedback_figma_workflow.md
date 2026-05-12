---
name: ""
description: 스크린샷+PNG 2x 공유 + 링크=요구사항 트리거 + React export 시 semantic 변환 + 아이콘 SVG 추출 표준 절차/트랩
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5b68a5d7-0991-477b-8442-2fad7e6c321a
---

피그마 디자인 협업 관련 합의 규칙 모음입니다.

---

## 1. 피그마 공유 — 스크린샷 + Export PNG 2x

피그마 투 코드 추출은 토큰 낭비가 심하고 실제 구현에 사용 불가. 스크린샷 + 간단한 설명으로 공유받습니다.

**공유 방법:** 프레임 다중 선택 → Export (PNG, 2x) 일괄 내보내기. 전체 개요 스크린샷은 해상도가 낮아 텍스트/아이콘 식별 불가.

**Why:** Claude는 이미지 확대 불가. 추출 코드는 div 중첩/absolute/고정 px 등 어차피 사용 불가.

**Figma MCP 사용 금지:** 사용자가 이전에 MCP 연결에 5시간+ 투자했지만 실패하고 이미지 공유로 결론. 새 작업 시 "피그마 링크 주세요 → MCP로 읽을게요" 제안 금지. 무조건 스크린샷/Export PNG 2x로 요청.

**How to apply:** 사용자가 코드 추출 붙여넣으면 스크린샷 방식 권유. 프레임 이름 정리해두면 순서대로 파악 가능.

---

## 2. 피그마 링크 = 요구사항 저장 트리거

사용자가 새 세션에서 figma.com 링크만 단독으로 보내면 MVP 요구사항 피그마 링크입니다.

**Why:** 매번 "이게 뭐야", "요구사항 저장해줘" 설명 없이 링크만 줄 테니 바로 인지하고 처리해달라고 요청.

**How to apply:**
1. 새 세션에서 figma.com 링크가 오면 → 요구사항 피그마로 인지
2. 바로 Figma 플러그인으로 접근해서 MVP 요구사항 읽기
3. 읽은 내용을 메모리에 저장 (wiki `mvp-req-001-019` 업데이트)
4. MEMORY.md 업데이트

---

## 3. Figma React export는 의미 부여를 개발자가 한다

Figma React export(MCP/Dev Mode)는 시각 디자인만 보존하고 모든 텍스트/컨테이너를 `<div>`로 떨굼. semantic HTML과 a11y 속성 부여는 개발자가 변환 단계에서 직접 합니다.

**Why:** Figma는 시각 디자인 도구라 "이게 제목인지 본문인지 버튼인지" 의미 정보를 갖고 있지 않음. export 도구는 안전하게 모든 걸 `<div>`로 떨굼.

**4단계 변환:**
1. 제목 텍스트 `<div>` → `<h1>`/`<h2>`/`<h3>` (계층). 모달이면 `<h2 id="...">` + 컨테이너 `aria-labelledby`로 연결
2. 본문 텍스트 `<div>` → `<p>` (단락). 짧은 라벨은 `<span>` 또는 div 유지
3. 인터랙티브 `<div onClick>` → `<button>`/`<a href>` (네이티브 키보드/포커스/스크린리더 동작 무료)
4. 모달/오버레이 → `role="dialog" aria-modal="true" aria-labelledby="..."` (shadcn Dialog 미사용 시)

**부수 정리:**
- `data-속성-1="..."` Figma 메타데이터 삭제 (코드 인덱스/grep 노이즈)
- `font-['Pretendard']` inline은 글로벌 폰트면 제거
- `text-*` 안의 `justify-*` (flex 자식 정렬용)는 텍스트 정렬엔 무의미 → 제거

**판별 기준:** "키보드 Tab으로 포커스해서 Enter로 동작?" → `<button>`/`<a>`. "페이지 구조의 일부?" → 적절한 semantic 태그.

---

## 4. 피그마 아이콘 SVG 추출 워크플로우 + MCP 한계

피그마 시안 아이콘을 프론트에 가져올 때 표준 순서.

### 표준 순서
1. 디자이너 컴포넌트 라이브러리(`reference_figma_design_system_page`)에서 노드 ID 찾기
2. **사용자가 피그마에서 직접 SVG export** (MCP 자동 추출 불가)
3. 받은 SVG 구조 확인 — viewBox 24×24 / `fill="none"` / stroke 또는 fill 색 확인
4. `stroke="..."` / `fill="..."` 색 값을 `currentColor`로 치환(svg 루트 `fill="none"` 유지)
5. React 컴포넌트화: viewBox 고정 + size prop + SVGProps forward + 학습용 주석
6. 사용처 import 1줄 교체

### MCP raster 한계
피그마 MCP의 `get_design_context`는 SVG raw 안 주고 **여러 `<img>` 레이어를 absolute로 합친 raster 자산**으로 반환(`mcp/asset/...` URL, 7일 만료). 그대로 쓰면:
- 7일 후 URL 만료로 깨짐
- `currentColor` 색 제어 불가
- 크기 조절 시 흐려짐

→ 자동 추출 의존 금지, 사용자 직접 export가 표준.

### 트랩 4종

**트랩 1: 노드 깊이 (24×24 vs 60×60)** — 피그마는 아이콘 본체(24×24) 바깥에 슬롯 박스(60×60)로 감싸는 구조 흔함. 바깥 박스 export하면 24×24에서 8px로 쪼그라듦. 안전장치: export 직전 우측 패널 selection 크기 **`24 × 24`** 확인. 2026-05-11 more.svg 사례 — 60×60 슬롯 → 진짜 아이콘 중앙 20×20만 → 사용자가 lucide 유지로 우회.

**트랩 2: on/off variant** — 같은 아이콘을 on/off 두 variant로 만들어둔 경우. **시나리오 A**: 모양 동일, 색만 다름(`#000`↔`#99A1AF`) → `currentColor` 단일 SVG, 부모 `text-*`로 색 전환. **시나리오 B**: 모양 자체 다름 → 컴포넌트가 active prop으로 분기, SVG 2개. 판별: 임의 2쌍 spot-check. 2026-05-11 사이드바는 시나리오 A.

**트랩 3: fill + stroke 혼합 (ProfileIcon 류)** — 마스코트형은 한 SVG에 `fill` 영역(코·눈)과 `stroke` 영역(입 곡선)이 섞임. 두 곳 모두 `currentColor` 치환해야 단일 색 통일. svg 루트 `fill="none"`은 유지.

**트랩 4: JSX 변환** — `stroke-width` → `strokeWidth`, `stroke-linecap` → `strokeLinecap`, `stroke-linejoin` → `strokeLinejoin`. `xmlns`는 생략 가능.

### 검증
- `tsc -b` 후 dev 서버 시각 확인
- active(`text-gray-900`) / inactive(`text-gray-400`) 전환 동작 확인

---

## 연관
- [[reference_figma_design_system_page]] — 노드 ID 매핑표
- [[project_figma_icon_migration]] — 점진 교체 진행 현황
