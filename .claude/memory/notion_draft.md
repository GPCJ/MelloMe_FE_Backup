---
name: 노션 업로드 대기 초안
description: 다른 기기에서 노션에 올릴 초안 — pull-mello 후 확인
type: project
originSessionId: 6ddff2ad-b5e4-45d6-8422-16a4eadb4382
---
# TIL — 서브 페이지 추가 (2026-04-10)

**위치:** TIL 페이지 하위 서브 페이지로 추가
**URL:** https://www.notion.so/323c8200749b80c2bbe6caf194055593

## 서브 페이지: 2026-04-10 — MIME 타입과 OS 환경 의존성

**분류**: 웹 / HTTP / 트러블슈팅

### 배운 것
브라우저가 파일 업로드 시 보내는 Content-Type(MIME 타입)은 파일 내용이 아니라 **OS에 등록된 MIME 매핑**을 따른다.

### 계기
게시글 첨부파일(PDF) 업로드 시 백엔드에서 400 에러가 발생. Swagger에서도 동일하게 실패해서 백엔드 버그로 판단했지만, Swagger curl을 확인한 결과 Content-Type이 `application/haansoftpdf`로 전송되고 있었음.

### 핵심 정리
- 백엔드는 `application/pdf`만 허용, 한컴 뷰어가 설치된 PC에서는 OS가 `.pdf`의 MIME 타입을 `application/haansoftpdf`로 등록
- 파일 내용은 동일한 PDF지만 MIME 타입(이름표)이 달라서 백엔드 검증 실패
- 프론트 해결: `new Blob([file], { type: 'application/pdf' })`로 MIME 타입 강제 지정
- 디버깅 핵심: Swagger curl 복사로 실제 요청 형태를 확인한 것이 원인 발견의 결정적 단서

### 다음에 써먹을 곳
- 파일 업로드 에러 시 curl/네트워크 탭에서 실제 Content-Type 확인하기
- 특정 환경에서만 재현되는 버그 → OS/소프트웨어 환경 차이 의심하기

---

# 트러블슈팅 — 서브 페이지 추가 (2026-04-10)

**위치:** 트러블슈팅 페이지 하위 서브 페이지로 추가
**URL:** https://www.notion.so/322c8200749b81f39f71f9c8a4d6eb44

## 서브 페이지: #009 — 게시글 첨부파일 업로드 400 에러 (MIME 타입 불일치)

**날짜**: 2026-04-10
**분류**: 파일 업로드 / HTTP
**난이도**: ⭐⭐⭐

## 문제 상황
게시글에 PDF 첨부파일 업로드 시 400 "유효하지 않은 첨부 파일입니다." 에러 발생.
Swagger UI에서 직접 호출해도 동일 에러 → 프론트/백엔드 어디가 원인인지 불명확.

## 원인 분석
1. Swagger curl을 복사해 확인한 결과, 파일의 Content-Type이 `application/pdf`가 아니라 `application/haansoftpdf`로 전송되고 있었음
2. 한컴 뷰어가 설치된 PC에서 OS가 `.pdf` 파일의 MIME 타입을 `application/haansoftpdf`로 등록
3. 브라우저는 파일 선택 시 OS의 MIME 매핑을 그대로 사용
4. 백엔드 `validatePdf()`는 `Set.of("application/pdf")`만 허용 → 불일치로 400

## 해결 과정
1. 처음에는 Swagger에서도 실패하니까 "백엔드 버그 확정"으로 판단 → 이슈 #8, #9 등록
2. 백엔드 소스코드(`LocalFileStorageService.java`) 확인 → PDF만 허용되는 것을 발견
3. 하지만 진짜 PDF를 보내도 실패 → Swagger curl 복사로 실제 요청 확인
4. `type=application/haansoftpdf` 발견 → 한컴 뷰어의 MIME 등록이 원인
5. 프론트에서 `new Blob([file], { type: 'application/pdf' })`로 MIME 타입 강제 지정하여 해결

## 핵심 개념
- **MIME 타입**: 파일의 형식을 나타내는 식별자. 브라우저가 서버에 파일을 보낼 때 Content-Type 헤더에 포함
- **OS MIME 매핑**: 특정 프로그램(한컴 뷰어 등)을 설치하면 OS의 파일 확장자↔MIME 매핑이 변경될 수 있음
- **Blob 생성자**: `new Blob([file], { type: '...' })`로 MIME 타입을 강제 지정 가능

## 면접 포인트
- "환경에 따라 동일한 파일도 다른 MIME 타입으로 전송될 수 있다"는 점을 알고 있는가
- 파일 업로드 디버깅 시 curl/네트워크 탭에서 실제 요청을 확인하는 습관
- 프론트에서 MIME 타입을 강제 지정하는 방법 (Blob)
