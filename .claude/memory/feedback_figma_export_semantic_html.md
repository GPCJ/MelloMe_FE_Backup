---
name: Figma React export는 의미 부여를 개발자가 한다
description: Figma의 코드 export는 모든 요소를 div로 떨굼 — semantic HTML(h2/p/button/role)은 변환 단계에서 개발자가 직접 추가
type: feedback
originSessionId: d7966e96-641e-4634-8a56-ba846785409b
---
Figma React export(MCP/Dev Mode)는 시각 디자인만 보존하고 모든 텍스트/컨테이너를 `<div>`로 떨굼. semantic HTML과 a11y 속성 부여는 개발자가 변환 단계에서 직접 한다.

**Why:** Figma는 시각 디자인 도구라 "이게 제목인지 본문인지 버튼인지" 의미 정보를 갖고 있지 않음(레이어 이름에서 일부 추측만 가능). export 도구는 안전하게 모든 걸 `<div>`로 떨굼. 의미 부여 = 개발자 책임.

**How to apply:** Figma export 받으면 4단계 변환 후 작성:
1. 제목 텍스트 `<div>` → `<h1>`/`<h2>`/`<h3>` (계층에 맞게). 모달이면 `<h2 id="...">` + 모달 컨테이너의 `aria-labelledby`로 연결
2. 본문 텍스트 `<div>` → `<p>` (단락이면). 짧은 라벨 텍스트는 `<span>` 또는 그대로 div 유지
3. 인터랙티브 요소 `<div onClick>` → `<button>` 또는 `<a href>` (네이티브 키보드/포커스/스크린 리더 동작 무료)
4. 모달/오버레이 컨테이너 → `role="dialog" aria-modal="true" aria-labelledby="..."` (shadcn Dialog 미사용 시)

**부수 정리:**
- `data-속성-1="..."` 같은 Figma 메타데이터 삭제 (코드 인덱스/grep 노이즈)
- `font-['Pretendard']` inline 지정은 프로젝트 글로벌 폰트가 Pretendard면 제거 가능
- `text-*` 안에 `justify-*` 클래스 (flex 자식 정렬용)는 텍스트 정렬엔 무의미 — Figma export 잔재라 제거

**판별 기준:** "이 요소를 키보드 Tab으로 포커스해서 Enter로 동작시켜야 하는가?" → Yes면 무조건 `<button>`/`<a>`. "이 요소가 의미적으로 페이지 구조의 일부인가?" → Yes면 적절한 semantic 태그.
