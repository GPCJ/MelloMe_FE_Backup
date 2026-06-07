---
name: shadcn Button/DropdownMenuTrigger asChild 미지원 — className 직접 적용 패턴
description: @base-ui/react 기반 shadcn 컴포넌트는 asChild 미지원 — buttonVariants 또는 className 직접 적용으로 우회
type: feedback
originSessionId: 5c1474ba-454d-4ace-a838-b4d4fb191aba
---
이 프로젝트의 shadcn 컴포넌트는 `@base-ui/react` 기반이라 Radix UI의 `asChild`(Slot) 패턴을 지원하지 않습니다. `asChild` props 사용 시 TS2322 (`Property 'asChild' does not exist`) 에러가 발생합니다.

**Why:** 2026-03-14 Button에서 처음 발견 — Vercel 빌드 실패 원인이었음. `tsc --noEmit`은 통과했지만 `tsc -b`에서 잡힘. 2026-05-08 DropdownMenuTrigger도 동일 패턴 확인됨 (UserMenu 컴포넌트 작성 시).

**How to apply:**

### Button → Link
`buttonVariants()` 함수로 클래스만 추출해서 Link에 적용.

```tsx
import { buttonVariants } from '@/components/ui/button'
import { Link } from 'react-router-dom'

// variant/size 기본값
<Link to="/login" className={buttonVariants()}>로그인</Link>

// variant/size 지정
<Link to="/path" className={buttonVariants({ variant: 'outline', size: 'lg' })}>텍스트</Link>
```

### DropdownMenuTrigger
trigger 자체에 className 직접 적용 + children은 아이콘만 넣어 button 중첩 회피.

```tsx
<DropdownMenuTrigger className="p-2 rounded-xl ..." aria-label="더보기">
  <MoreHorizontal size={24} />
</DropdownMenuTrigger>
```

다음에 다른 shadcn 컴포넌트에 `asChild` 시도 전 동일 우회 가능성 먼저 확인.

**⚠️ 사용자 인지부채 플래그 (2026-05-27):** 쪽지 `UserActionDropdown` 단위2 작업 중, 본인이 "이 프로젝트 dropdown = shadcn처럼 보이지만 속은 `@base-ui/react`라 `asChild` 없음 → 감싸기가 정답"을 아직 체화 못 한 상태로 자각. "shadcn이라서 감쌌다"로 잘못 설명했고 교정 받음. 재등장 시 이 구분(shadcn 폴더명 ≠ Radix, 실토대는 base-ui)을 다시 짚을 것. 관련 작업: [[dm-api]] slice 1.
