---
name: ProfilePage 시그널 시안 정합 + 회원 탈퇴 MVP 제외 (2026-05-11)
description: ProfilePage 헤더 시안 정합(톱니바퀴→Search+UserPen), 편집 진입점 단일화, 회원 탈퇴 UI MVP 범위 밖 확정, 탭 시그널 메타포, 본문 폭 640px 축소
type: project
originSessionId: 7995ba5d-ae6a-4595-b108-958435a2b8ad
---
2026-05-11 ProfilePage 시안 정합 작업 결정 묶음. 시안 노드: figma `1427:22026`.

## 헤더 우측 액션
- **변경**: 톱니바퀴(no-op) → `Search`(UI only, no-op) + `UserPen`(프로필 편집 단일 진입점)
- **Why**: Chrome 통일(05-08) 이후 로그아웃/계정/고객센터는 SideNav 케밥/UserMenu로 이동 → ProfilePage 톱니바퀴 잉여. 시안의 돋보기는 PC 검색 진입점 placeholder, 편집(UserPen)은 닉네임/프로필 수정 진입점.
- **How to apply**: 검색 기능 도착 시 `Search`만 onClick 부착. 다른 페이지 헤더 패턴(PostListPage 등) 일관성 검토 가치 있음.

## 편집 진입점 단일화
- 본체 "프로필 수정" 버튼 제거 → 헤더 `UserPen` 한 곳으로 통일 (`onClick={startEditNickname}`)
- **Why**: 두 진입점이 동일 동작이라 잉여 + 시안 본체 영역에 해당 버튼 없음
- **How to apply**: 추후 편집 모드 UI 확장(자기소개 등) 시 헤더 UserPen 한 곳에서 분기

## 회원 탈퇴 UI — MVP 범위 밖 확정
- 본체 "회원 탈퇴" 버튼 + `handleDeleteAccount` 함수 + `deleteAccount` API import + `clearAuth` 사용 모두 제거
- **Why**: MVP 최종본에 포함 안 하기로 사용자 명시(2026-05-11). MVP 발표일 2026-05-15 D-4 시점 scope 정리
- **How to apply**: post-MVP에 탈퇴 진입점 복구 시 헤더 UserMenu/SideNav 케밥 메뉴 항목으로 신설 검토(본체 노출 X)

## 탭 라벨 — 시그널 메타포
- `내가 쓴 글` → **내 시그널**
- `답글 단 글` → **이어진 시그널**
- `스크랩` → **수집한 시그널**
- **Why**: 시안 카피 통일. 멜로미의 "시그널" 개념(치료사 간 신호 주고받기) 노출 강화
- **How to apply**: 다른 페이지 빈 상태/CTA 카피도 시그널 메타포 정합 검토 (PostListPage 빈 피드, PostCreatePage CTA 등)

## 본문 폭
- 최상위 wrapper: `pb-20 md:pb-8` → `pb-20 md:pb-8 mx-auto max-w-[640px]`
- **Why**: 시안 PC 컬럼 폭 640px (max-w-[700px] 안에 w-[640px]). 좌측 SideNav 60px와 균형
- **How to apply**: 다른 페이지(PostListPage 등) 풀폭 vs 640px 컬럼 일관성 — 통일은 별도 안건(다른 페이지 손대지 않음)

## 한계점 / 후속
- **빈 상태 카피 미반영**: 시안 annotation에 "첫 시그널을 보내세요!" / "시그널을 이어보세요!" / "시그널을 수집해보세요!" 명시. 이번 범위에서는 라벨만 변경 → 빈 상태 메시지는 backlog 후속
- **편집 진입점 헤더 단일화의 발견 가능성**: 본체에 "프로필 수정" 텍스트 버튼이 사라져 신규 유저가 UserPen 아이콘의 의미를 모를 수 있음. tooltip/onboarding 부재. 디자이너 시안이 아이콘만 두는 의도이므로 일단 시안 따름
