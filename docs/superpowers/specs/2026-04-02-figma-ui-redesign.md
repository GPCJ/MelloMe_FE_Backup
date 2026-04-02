# Figma UI Redesign Spec

피그마 와이어프레임 기반 프론트엔드 UI 일괄 수정.
디자인 확정된 부분만 구현, 불확실한 부분은 임시 처리 또는 보류.

---

## 1. 공통 컴포넌트 (신규)

### 1-1. ReactionBar
- 3종 리액션: EMPATHY(하트), APPRECIATE(별), HELPFUL(전구)
- 각 리액션별 카운트 표시 + 클릭 토글
- 임시 Lucide 아이콘 (Heart, Star, Lightbulb), 디자이너 확정 후 교체
- 사용처: PostCard, PostDetailPage

### 1-2. VerifiedBadge
- 닉네임 우측 "인증" 텍스트 배지
- 치료사 인증 완료 유저에게만 표시
- 사용처: PostCard, PostDetailPage, ProfilePage, 댓글 영역

### 1-3. SimpleTextEditor
- TipTap 대체, 단순 `<textarea>`
- 글자 수 카운트 (0/2000)
- placeholder 지원
- 사용처: PostCreatePage, PostEditPage

---

## 2. 페이지 변경

### 2-1. PostCreatePage
- 제목(title) 필드 제거 — API 전송 시 `title: ""` 빈 문자열 (백엔드 optional/삭제 요청 예정)
- TipTap → SimpleTextEditor 교체
- 연령대(AgeGroup) 선택 제거
- 하단 레이아웃: 첨부(클립) 아이콘 + "게시 하기" 버튼 (검정 배경)
- 치료영역 칩 선택 유지 (5개)

### 2-2. PostEditPage
- PostCreatePage와 동일하게 변경
- 기존 게시물의 title은 무시 (표시 안 함)

### 2-3. PostDetailPage
- 단일 공감 버튼 → ReactionBar 3종 교체
- 작성자 닉네임 옆 VerifiedBadge 추가
- 팔로우 버튼: 미구현 (백엔드 대기)

### 2-4. PostListPage (홈 피드)
- PostCard에 ReactionBar 3종 반영
- PostCard에 VerifiedBadge 반영
- 블러 게시글 UI: 기존 코드 유지

### 2-5. SearchPage (신규)
- 라우트: `/search`
- 레이아웃: 뒤로가기(←) + 검색 인풋 + 돋보기 버튼
- 치료영역 필터 칩 (5개)
- 검색 결과: PostCard 리스트 재사용
- 빈 결과: "검색 결과가 없습니다" 안내 문구
- 홈 피드 헤더의 검색 아이콘 클릭 → `navigate('/search')`

### 2-6. MyPage → ProfilePage 리뉴얼
- 대시보드/통계 카드 전부 제거
- 프로필 헤더: 아바타 + 닉네임 + "인증하기"(미인증) 또는 "인증됨"(인증완료) + 자기소개
- 팔로워/팔로잉: 자리만 잡아두고 0 표시 (백엔드 대기)
- 3탭: 내가 쓴 글 / 답글 단 글 / 스크랩
- 탭 내용: PostCard 리스트 재사용

### 2-7. 모바일 헤더 수정
- 모바일(md 이하): "치료사 커뮤니티" 텍스트 + 검색 아이콘만
- 데스크탑(md 이상): 현재 유지 (로고, 네비게이션, 알림, 프로필 드롭다운)

---

## 3. 라우팅 변경

### 정책 변경
게시물 열람은 로그인만 필요 (치료사 인증 불필요). 인증 전용 게시글은 블러 처리.

### 라우트별 가드
| 라우트 | 가드 | 변경 |
|--------|------|------|
| `/posts` | AuthRoute | ProtectedRoute → AuthRoute |
| `/posts/:postId` | AuthRoute | ProtectedRoute → AuthRoute |
| `/search` | AuthRoute | 신규 |
| `/posts/new` | ProtectedRoute | 유지 |
| `/posts/:postId/edit` | ProtectedRoute | 유지 |
| `/my-page` | ProtectedRoute | 유지 |

---

## 4. 삭제 대상

### 컴포넌트/파일
- `RichTextEditor.tsx` — TipTap 에디터 컴포넌트

### 패키지 (TipTap 관련)
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*` 등

### 코드 제거
- PostCreatePage/PostEditPage: title input, AgeGroup 선택 UI
- MyPage: 대시보드 탭 (통계 카드, 주간 활동)
- 타입: AGE_CHIPS 상수, AgeGroup 관련 로직

### 유지
- `DOMPurify` — 기존 리치텍스트 게시글 렌더링용
- PostCard 블러 로직 — 기존 유지
- 댓글 인라인 UI — 디자이너 확정 전까지 현행 유지

---

## 5. 임시 처리 (추후 변경 필요)

| 항목 | 임시 처리 | 최종 처리 |
|------|----------|----------|
| title 필드 | 빈 문자열 전송 | 백엔드 optional/삭제 후 제거 |
| 리액션 아이콘 | Lucide (Heart/Star/Lightbulb) | 디자이너 커스텀 아이콘 교체 |
| 팔로워/팔로잉 | 0 표시 | 백엔드 API 완료 후 연결 |
| 팔로우 버튼 | 미구현 | 백엔드 API 완료 후 추가 |

---

## 6. 변경 안 함

| 항목 | 이유 |
|------|------|
| 댓글 UI 구조 (인라인) | 디자이너 확정 후 변경 |
| 치료영역 개수 (5개) | 확장은 추후 결정 |
| 데스크탑 헤더 | 디자이너 데스크탑 디자인 전까지 유지 |
| 하단 네비게이션 (모바일) | 현재와 피그마 동일 (홈/글쓰기/프로필) |
