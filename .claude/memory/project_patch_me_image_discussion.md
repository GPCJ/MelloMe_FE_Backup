---
name: PATCH /me 프로필 이미지 업로드 방식 논의
description: 프로필 수정 시 이미지를 별도 엔드포인트 없이 multipart로 직접 업로드하는 방식 제안
type: project
---

## 논의 (2026-04-04)

CSV 스펙 기준 PATCH /me는 `nickname, profileImageUrl`을 받는데, profileImageUrl은 서버 저장 URL.
이미지 업로드용 별도 엔드포인트가 38개 항목에 없음.

## jin24님 제안

별도 엔드포인트로 파일 업로드 → URL 받기 → 다시 PATCH 요청 = **비효율적**
→ PATCH /me 자체를 `multipart/form-data`로 바꿔서 nickname + profileImage(파일)를 한 번에 전송

## 백엔드 요청 사항

> PATCH /api/v1/me — Content-Type: multipart/form-data
> - nickname (string, optional)
> - profileImage (file, optional)
> 서버에서 이미지 저장 후 profileImageUrl 생성, 응답에 포함

치료사 인증(POST /therapist-verifications)에서 이미 multipart 패턴 사용 중이므로 동일 패턴.

## 상태: 백엔드 논의 필요

## 역량 어필 포인트

- **불필요한 API 왕복 제거**: 업로드 → URL 수신 → 재요청의 2-step을 1-step으로 간소화 제안
- **기존 패턴 활용**: 프로젝트 내 치료사 인증 multipart 구현 경험을 근거로 실현 가능성 판단
