---
name: 와이어프레임 vs 현재 구현 비교 (2026-03-12)
description: src.zip 와이어프레임 기준 미구현 페이지 목록 — feature-codegen에서 개발 착수 시 참고
type: project
---

와이어프레임(src.zip) 기준으로 미구현 페이지 4개를 확인함.

**Why:** 와이어프레임에는 5개 라우트가 정의되어 있으나 현재 프로젝트에는 Home, Login만 구현된 상태.

**How to apply:** feature-codegen 워크트리에서 아래 미구현 페이지들을 순서대로 개발할 것.

## 와이어프레임 라우트 구조

```
/ → Home
/clinical-talk → ClinicalTalk (임상톡톡 목록)
/clinical-talk/:id → ClinicalTalkDetail (임상톡톡 상세)
/clinical-talk/create → ClinicalTalkCreate (임상톡톡 작성)
/my-page → MyPage (마이페이지)
```

## 구현 현황

| 경로 | 와이어프레임 파일 | 현재 상태 |
|---|---|---|
| `/` | `pages/Home.tsx` | ⚠️ 구현됨 — placeholder 수준 |
| `/login` | *(없음)* | ✅ 구현됨 — 와이어프레임 외 추가 |
| `/clinical-talk` | `pages/ClinicalTalk.tsx` | ❌ 미구현 |
| `/clinical-talk/:id` | `pages/ClinicalTalkDetail.tsx` | ❌ 미구현 |
| `/clinical-talk/create` | `pages/ClinicalTalkCreate.tsx` | ❌ 미구현 |
| `/my-page` | `pages/MyPage.tsx` | ❌ 미구현 |

## 참고

- 와이어프레임은 `C:\Users\jin24\Downloads\src.zip` (WSL: `/mnt/c/Users/jin24/Downloads/src.zip`)
- UI 컴포넌트: shadcn/ui 계열 (`app/components/ui/` 다수 포함)
- 라우터: React Router `createBrowserRouter` 사용 (와이어프레임 기준)
