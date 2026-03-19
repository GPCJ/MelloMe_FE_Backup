---
name: Layout.tsx import 위치 수정 이력
description: Layout.tsx 하단에 잘못 추가된 useState import를 파일 상단으로 이동한 수정 이력
type: project
---

`frontend/src/components/Layout.tsx` 파일 하단에 `import { useState } from 'react'`가 중복으로 잘못 추가되어 있었음 (export default 함수 닫힌 이후 위치). 파일 최상단으로 이동하여 수정 후 커밋.

commit: `e90f0bc` — fix: Layout.tsx import 위치 수정
commit: `40f7e31` — fix: Layout.tsx 미사용 LoginForm 컴포넌트 제거

**Why:** LoginForm은 미사용 컴포넌트였고 TS 에러(미사용 변수, null 체크 누락, 인자 누락)로 Vercel 빌드 실패.

**How to apply:** LoginForm은 완전히 제거됨. Layout.tsx는 현재 헤더/푸터 네비게이션만 포함.
