---
name: project_pm_scrum_priority_2026_06_29
description: "PM 데일리스크럼(06-29) — 마감 7월 중순(~7/19), 모바일 앱 후순위 강등, 기존 기능 고도화로 유입·잔류율 수치 개선 목표. 팔로우 기능 삭제(백업 후) 지시."
metadata: 
  node_type: memory
  type: project
  originSessionId: b14d9894-fe27-4819-a8ce-3f3e06577cc4
---

# PM 데일리스크럼 결정 (2026-06-29)

[[project_pm_priority_acquisition_over_community_2026_06_22]]의 후속/확정. 06-22 "유입 > 커뮤니티 고도화" 기조를 일정 제약과 함께 더 강하게 재확인.

## ① 일정 + 우선순위 재조정
- **프로젝트 마감 = 7월 중순** (PM 발언 "7/19쯤", **정확 날짜 미확정** — 차기 스크럼서 확인 필요).
- **모바일 앱(Capacitor) 출시는 기간 내 불가 → 개발 후순위로 강등.** [[project_capacitor_mobile_app_2026_06_11]]의 MEL-72 블로커 대기 건 포함, Capacitor 트랙 전체 보류. (제출 후 개인 학습 트랙으로 남기는 건 별개)
- **목표 = 기존 기능 고도화로 유입·유저 잔류율(리텐션) 등 수치적 개선.** 새 기능보다 기존 기능의 지표 개선이 우선.

## ② 팔로우 기능 삭제 — ✅ develop 머지 완료 (PR #31, 2026-06-30 `91215ed`)
> 게이트 A(tsc/build/grep 0)+게이트 B(로컬 dev=staging API로 런타임 QA 5/5: 전체피드·구인탭보존·?tab=following 폴백·작성자드롭다운 프로필/쪽지만·마이페이지 카운트제거) 통과 후 머지. backup/follow-feature origin 생존. main 반영은 다음 prod 머지 시.
- **근거**: 유저 수 적음 + 상호작용 저조 → "있으나 마나" → 삭제.
- **결정**: 범위=**기능 전체 제거**, 백업 방식=**Git 백업 브랜치**(feature flag 아님 — 죽은 코드 잔존 회피).
- **실행 (06-29)**:
  - 브랜치 `chore/remove-follow`(base=develop), 커밋 `466b397`, **PR #31** → develop. 백업 `backup/follow-feature`=제거 직전 develop 스냅샷, **origin push 완료**(복구 보장). 복구=해당 브랜치 cherry-pick 또는 PR revert.
  - 제거: `/follow` 페이지+라우트, 홈피드 '팔로우' 탭, ProfilePage 카운트, UserActionDropdown 팔로우 버튼(프로필·쪽지 유지), NEW_FOLLOW SSE+enum. 전용 5파일 삭제(api/types/2훅/pages·follow).
  - **보존**: 전체/구인 탭, 무한스크롤·스크롤 복원 스냅샷 로직.
  - 검증: tsc ✅ / build ✅(prerender 3p) / 잔여 follow 참조 0 / diff 15파일 +22−510.
- 관련(이제 사실상 데드): [[project_follow_feature]], [[project_follow_implementation_2026_06_09]], [[project_follow_feed_tab_implementation_2026_06_09]].

## 함의
- backlog의 팔로우 후속(F-12 맞팔, F-15 후속)은 사실상 **데드** (기능 삭제 시).
- 향후 작업 선정 = "유입/리텐션 수치를 움직이는가" 기준으로 triage.
