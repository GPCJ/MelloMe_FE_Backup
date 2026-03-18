---
name: TypeScript 타입 에러 확인 방법
description: TS 타입 에러는 브라우저에 안 보임 — CLI로 확인하는 방법 기억해두기
type: feedback
---

TypeScript 타입 에러는 브라우저 화면에 나타나지 않음. Vite는 타입 검사 없이 JS로 변환만 함.

**Why:** 사용자가 VSCode보다 CLI 위주로 작업하기 때문에 빨간 줄을 놓칠 수 있음.

**How to apply:** 백엔드 API 응답 형식 변경, 타입 관련 버그 의심 상황에서 아래 명령어를 리마인드할 것.

```bash
cd frontend && npx tsc -b
```

- `tsc -b` 사용할 것 — Vercel 빌드도 `tsc -b`를 사용하므로 로컬과 일치함
- `tsc --noEmit`은 프로젝트 참조(tsconfig references)를 무시해서 실제 빌드와 다른 결과가 나올 수 있음
- 에러 없으면 아무 출력 없음
- 에러 있으면 파일명 + 줄 번호 + 메시지 출력
