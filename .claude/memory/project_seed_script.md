---
name: DB 테스트 데이터 시딩 스크립트
description: 실제 백엔드 연결 후 게시글 19개를 일괄 삽입하는 브라우저 콘솔 스크립트
type: project
---

백엔드 로그인 응답 수정 완료 후, 브라우저 콘솔에서 실행할 것.
MSW가 꺼진 상태(`VITE_MSW_ENABLED=false`)에서 실행해야 함.

**실행 조건:**
1. 백엔드 로그인 응답 구조 수정 완료
2. THERAPIST 또는 ADMIN 계정으로 앱에서 로그인
3. 브라우저 콘솔(F12)에서 아래 스크립트 실행

**스크립트 구성:** therapy_board 10개, document_board 5개, anonymous_board 4개 (총 19개)

```js
const { tokens } = JSON.parse(localStorage.getItem('auth-storage')).state;
const BASE = 'http://43.203.40.3:8080/api/v1';
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${tokens.accessToken}`,
};
// ... (posts 배열 + fetch 루프)
```

**Why:** 게시글을 일일이 작성 버튼으로 넣는 대신 한 번에 삽입하기 위함
**How to apply:** 백엔드 로그인 수정 완료 알림 받으면 이 스크립트 다시 제공 요청할 것
