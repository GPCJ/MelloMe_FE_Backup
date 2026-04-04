---
name: 프로필 수정 기능 구현
description: 프로필 이미지 업로드 + 닉네임 수정 기능 구현 완료, PATCH /me profileImageUrl 임시 대응 이슈 존재
type: project
---

프로필 수정 기능 구현 완료 (04-05):
- **이미지 업로드**: `POST /me/profile-image` — multipart/form-data, 프론트 선검사(jpg/png/webp, 5MB)
- **닉네임 수정**: `PATCH /me` — 닉네임 변경 용도, 프로필 수정 버튼 → 인라인 input 전환 방식

**Why:** MVP 프로필 수정 기능 필요
**How to apply:** `PATCH /me`에서 `profileImageUrl`을 스토어 값 그대로 전달하는 임시 대응 중. 백엔드에서 optional로 변경되면 코드 정리 필요.

관련 이슈:
- GPCJ/MelloMe_FE_Backup#2
- AIRO-offical/therapist_community_FE#1
