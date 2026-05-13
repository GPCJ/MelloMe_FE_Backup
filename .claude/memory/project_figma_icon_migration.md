---
name: 피그마 시안 아이콘 점진 교체
description: lucide-react → 피그마 시안 아이콘 점진 교체 결정 + 사이드바·모바일 BottomNav 진행 결과 (2026-05-11~12)
type: project
originSessionId: a595a01c-bbfb-4ba3-94cc-d340da6e58c4
---
# 피그마 시안 아이콘 점진 교체 (2026-05-11~)

`lucide-react`에서 피그마 시안 아이콘으로 점진 교체 중. 한 번에 전체 교체가 아니라 사용자가 지시하는 구역별로 1구역씩.

## 작업 방식

- lucide-react와 공존하며 점진 교체, 마지막 구역까지 끝난 뒤 lucide 의존성 제거 검토
- 위치: `frontend/src/components/icons/` 신설(도메인별 구조와 일관)
- 구현: SVG path 인라인 React 컴포넌트(svgr 같은 추가 의존성 0)
- 색: SVG의 `stroke`/`fill` → `currentColor`, 부모 `text-*` 클래스로 active/inactive 색만 전환
- 굵기 동적 변경(`strokeWidth={active ? 2.2 : 1.5}`) 폐기 — 시안은 굵기 고정, 색만 다름

## 1차 — 사이드바 5개 완료

생성한 컴포넌트: `HomeIcon`, `SearchIcon`, `WriteIcon`, `BellIcon`, `ProfileIcon` + `index.ts` barrel.

`SideNav.tsx`에서 lucide의 Home/Search/SquarePen/Bell/User 5개 import 제거, 새 컴포넌트로 교체. JSX 구조·active 색 로직·UserMenu(케밥)는 그대로.

`MoreHorizontal`만 lucide 유지. 이유: 사용자가 받은 more.svg가 60×60 슬롯 박스 통째로 export돼 시안 정합 어려움. 추후 `IconNavOption`(노드 `1498:25756`) 24×24만 정확히 export 받으면 교체 가능.

## 2차 — 모바일 BottomNav 5개 완료 (2026-05-12, 커밋 `bd8da18`)

`Layout.tsx`의 BottomNav에서 lucide의 Home/Search/PlusCircle/Bell/User 5개를 PC SideNav와 동일한 시안 컴포넌트(`HomeIcon/SearchIcon/WriteIcon/BellIcon/ProfileIcon`)로 교체. 새 컴포넌트 생성 없이 기존 5종 재사용.

부수 정리:
- 텍스트 라벨 `<span>` 5개 제거 → PC SideNav가 라벨 없으므로 시각 통일
- `flex-col gap-1` → `flex items-center`로 단순화 (라벨 제거로 의미 소실)
- `aria-label` 5개 추가(프로필은 `user ? '프로필' : '로그인'` 분기). PC는 `aria-label`+`title` 둘 다, 모바일은 hover 없어 `title` 생략

동작은 PC(글쓰기 모달 토글)와 모바일(`/posts/new` 라우트 이동)이 의도적으로 다름 — **아이콘만 통일, 동작은 그대로** (사용자 명시 결정).

## 검증 / 학습 부채

- typecheck 통과, dev 서버 시각 검증 통과
- AI가 5개 컴포넌트+barrel 직접 작성 → 인지부채 HIGH(`feedback_ai_written_code_cognitive_debt`) 후속 학습 대상

## 작업 브랜치 정리

`feat/ch-09-comments-redesign` 브랜치 위에서 진행됨(원래 develop에서 했어야 함). 사용자가 분리 작업 생략 결정 — 같은 브랜치에 사이드바 아이콘 변경 + 사용자가 직접 진행 중인 `ProfilePage.tsx` 변경(로그아웃 핸들러 → UserMenu 이관)이 공존.

## Why

MVP 시안 정합. 멜로미 브랜드 아이덴티티가 담긴 자체 아이콘(마스코트형 ProfileIcon, 물결 HomeIcon 등) 시안 그대로 반영.

## How to apply

- 다음 아이콘 구역(Header/PostCard 등) 작업도 동일 패턴 — SVG export → currentColor 치환 → 컴포넌트화 → import 교체
- 진행 상황 / 남은 구역은 backlog 참조(memory가 아니라 backlog)
- 점진 교체이므로 사용자 지시 단위로만 작업, 추론으로 확장 금지
