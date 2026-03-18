---
name: shadcn Button asChild 미지원 — buttonVariants + Link 패턴 사용
description: @base-ui/react 기반 Button은 asChild 미지원 — Link에 buttonVariants 클래스 직접 적용할 것
type: feedback
---

`<Button asChild><Link>...</Link></Button>` 패턴은 이 프로젝트의 Button 컴포넌트에서 동작 안 함.
`@base-ui/react` 기반이라 Radix UI의 asChild(Slot) 패턴을 지원하지 않아 tsc -b 에러 발생.

**Why:** 2026-03-14 Vercel 빌드 실패 원인이었음. `tsc --noEmit`은 통과했지만 `tsc -b`에서 잡힘.

**How to apply:** Button을 Link처럼 쓰고 싶을 때는 아래 패턴 사용.

```tsx
import { buttonVariants } from '@/components/ui/button'
import { Link } from 'react-router-dom'

// variant/size 기본값
<Link to="/login" className={buttonVariants()}>로그인</Link>

// variant/size 지정
<Link to="/path" className={buttonVariants({ variant: 'outline', size: 'lg' })}>텍스트</Link>
```
