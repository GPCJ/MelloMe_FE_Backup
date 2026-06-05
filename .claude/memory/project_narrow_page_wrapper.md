---
name: project_narrow_page_wrapper
description: 좁은 페이지 폭(640px)을 공용 NarrowPage 컴포넌트로 추출 — 새 좁은 페이지는 이걸 재사용
metadata: 
  node_type: memory
  type: project
  originSessionId: ee93657d-63f9-40e0-9d7d-0d50e90161da
---

좁은 페이지 폭(`max-w-[640px]`)을 매 페이지 반복 작성하던 걸 공용 `frontend/src/components/common/NarrowPage.tsx`로 추출 (develop `a567677`, 2026-06-05). props 없는 순수 래퍼 — `{children}`을 `mx-auto max-w-[640px] pb-20 md:pb-0` div로 감싸 반환.

**계기**: 사용자가 "페이지마다 헤더 너비를 매번 좁게 줄이고 있다"고 인지. 실제로는 `PageHeader`엔 너비 클래스가 없고(부모 폭 100% 추종), 폭은 헤더+본문을 감싸는 바깥 div가 정함. 그 바깥 div의 반복이 진짜 중복이었음.

**적용처 (3곳)**: MessageBoxPage(쪽지함)·NotificationPage(알림함)·MessageDetailPage 본문. **앞으로 좁은 페이지 추가 시 래퍼 div를 손으로 치지 말고 `<NarrowPage>`로 감쌀 것.** 폭 정책 변경은 이 파일 한 줄에서 일괄 관리.

**폭 정책 (혼합 유지, 통합 안 함)**:
- 좁은 계열 = 640px → NarrowPage
- 게시글 계열(PostListPage/PostDetailPage 등) = `max-w-3xl`(768px) → 별개 유지
- 제외: ProfilePage(`md:pb-8`로 패딩 다름), 로그인/회원가입 `w-full max-w-[640px]`(중앙정렬 카드라 성격 다름)

**쪽지 상세 가드 화면(`if (!validId)`)은 NarrowPage 미적용** — 짧은 안내 화면이라 하단바 여백 `pb-20`이 불필요. 폭만 맞춘 단순 div로 두고 사유 주석 박음.

F-09(알림 페이지 헤더 폭 과다, 단일 페이지 버그픽스, backlog 완료)와는 **별개의 DRY 리팩토링**. F-09는 한 페이지의 폭 불일치를 고친 것, 이건 반복 래퍼를 컴포넌트화한 것.

관련: [[project_chrome_unification_policy]] (PageHeader 단일화), [[project_messaging_feature]]
