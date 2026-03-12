# 프로젝트 개요

발달장애 아동 치료사들을 위한 커뮤니티 플랫폼.
정보공유, 심적호소 등 치료사 간 소통 공간 제공.
추후 학습 자료 업로드/판매 기능 확장 예정.

## 현재 개발 단계: MVP

MVP 범위:
- 회원가입 / 로그인 (JWT + Google OAuth)
- 게시물 CRUD (작성, 읽기, 수정, 삭제)

---

# 기술 스택

## Frontend (`/frontend`)
- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **상태관리**: Zustand
- **라우터**: React Router
- **API Mocking**: MSW (Mock Service Worker)

## Backend (`/backend`)
- **Framework**: Spring Boot (Java)
- **인증**: JWT Access/Refresh Token + Google OAuth2

## Infrastructure
- **DB**: PostgreSQL 16
- **컨테이너**: Docker Compose

---

# 프로젝트 구조

```
my-project/
├── frontend/          # React 앱
├── backend/           # Spring Boot 앱
├── docker-compose.yml
└── openapi-3.0.yaml   # API 스펙
```

---

# 개발 컨벤션

## 파일/컴포넌트 네이밍
- 컴포넌트: PascalCase (`PostCard.tsx`)
- 훅: camelCase + use 접두사 (`usePostStore.ts`)
- 유틸: camelCase (`formatDate.ts`)

## 폴더 구조 (frontend/src)
```
src/
├── components/     # 재사용 UI 컴포넌트
├── pages/          # 라우트 단위 페이지
├── stores/         # Zustand 스토어
├── hooks/          # 커스텀 훅
├── api/            # API 호출 함수
├── types/          # TypeScript 타입 정의
└── mocks/          # MSW 핸들러
```

## 코드 스타일
- 함수형 컴포넌트 + hooks 사용
- props 타입은 interface로 정의
- API 응답 타입은 `/types`에 정의

---

# API

- OpenAPI 스펙: `/openapi-3.0.yaml`
- 백엔드 주소: `http://localhost:8080`
- 개발 시 MSW로 API 모킹 가능
