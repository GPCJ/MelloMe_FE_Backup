---
name: shadcn UI 컴포넌트 기본 사용 원칙
description: UI 작업 시 shadcn/ui 컴포넌트를 기본으로 사용해야 한다
type: feedback
---

UI 작업 시 shadcn/ui 컴포넌트를 항상 기본으로 사용할 것.

**Why:** 나중에 디자이너가 UI를 완성했을 때 CSS 변수 기반으로 스타일을 일괄 적용하기 쉽게 하기 위해. 컴포넌트는 shadcn 기반, 스타일은 CSS 변수로 분리하는 방침.

**How to apply:**
- 버튼 → `Button`, `buttonVariants` + `Link`
- 카드 → `Card`, `CardContent` 등 Card 패밀리
- 뱃지/태그 → `Badge` (variant로 스타일 분기)
- 로딩 → `Skeleton`
- 인풋 → `Input`, `Label`
- 색상 텍스트 → `text-muted-foreground`, `text-destructive` 등 CSS 변수 클래스
- 새 컴포넌트가 필요하면 `npx shadcn@latest add <name>` 으로 설치 후 사용
- 순수 `<div>`, `<button>`, `<span>` 직접 사용은 shadcn에 해당 컴포넌트가 없을 때만
