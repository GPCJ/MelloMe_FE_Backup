---
name: GA4 이벤트 PM 정식 스펙 v1 (24종, 주요 7개)
description: 2026-04-27 PM CSV로 도착한 GA4 커스텀 이벤트 정식 스펙. 자동4 + 인증5 + 콘텐츠11 + 탐색6 + 체류1 = 24종, 주요 이벤트 7개 표시. 기존 4종(cf7750e)은 정식 명명으로 리네임 검토 대상
type: project
updated: 2026-04-27
originSessionId: 171770bc-7818-42fd-9134-3671e398b299
---
# GA4 이벤트 PM 정식 스펙 v1

PM이 CSV로 정식 스펙 공유 (2026-04-27).
원본 위치: `/mnt/c/Users/jin24/Downloads/멜로미 요구_기능 명세 - 지표&이벤트 수집.csv`

**Why:** 이전 4종(2026-04-24, 사용자 임시 선택)을 PM 정식 설계로 대체. 분석 이벤트 설계 오너는 PM이라는 정책에 부합.

**How to apply:**
- **주요 7개**(★)부터 추가 삽입을 1차 ship — **프론트 독립, 즉시 착수 가능** (analyticsId 드롭으로 백엔드 의존성 0)
- 기존 4종(cf7750e 커밋)은 PM 명명으로 리네임 후보 (B 단계에서 결정)
- 비주요 17개는 이후 점진 추가
- 익명 유지 (analyticsId 드롭 결정 그대로)

---

## 북극성 지표

유저 당 `post_created` & `comment_created` 달성 비율

## 카테고리별 이벤트 (★ = 주요 7개)

### GA4 자동 수집 (4)
`session_start` / `first_visit` / `page_view` / `user_engagement`
→ 자동 수집, 추가 작업 X (page_view는 useGA4PageView 훅으로 SPA 대응 완료)

### 인증/사용자 (5)
- **`sign_up`** ★ — 가입 완료
- **`profile_edited`** ★ — 프사/닉네임/자기소개 수정 완료
- **`certification_started`** ★ — 인증 페이지 진입
- `certification_submitted` — 면허증/치료영역 제출
- **`certification_completed`** ★ — 치료사 인증 확정

### 콘텐츠 생산/소비 (11)
- `post_write_started` — 글쓰기 화면 진입
- **`post_created`** ★ — 게시글 최종 등록
- `post_deleted`, `comment_created`, `comment_deleted`
- `attachment_previewed`, `attachment_download`
- **`reaction`** ★ — 댓글/공감3종/스크랩/다운로드 단일 이벤트, type param 분기
  - param: `comment` / `react_like` / `react_useful` / `react_curious` / `scrap` / `download`
- `feed_viewed`, `post_viewed`, `achive_tab_viewed`

### 피드/탐색 (6)
`feed_scrolled` / `feed_tab_switched` / `search_applied` / `filter_applied` / `notification_clicked` / `blurred_post_clicked`

### 체류 (1)
- **`screen_exit`** ★ — 화면 이탈 시
  - param: `screen_name` ∈ {feed, post_write, my_page}, `duration` (진입 시각 기준 계산)

---

## 기존 4종(cf7750e) 매핑

| 기존(이미 삽입) | PM 정식 스펙 | 매핑 판단 |
|---|---|---|
| `signup_completed` | `sign_up` ★ | 리네임 후보 |
| `login_completed` | (PM 스펙에 없음, `session_start` 자동) | 유지 또는 제거 검토 |
| `verification_requested` | `certification_submitted` | 리네임 후보 |
| `first_post_created` | `post_created` ★ + 별도 first 판별 | 의미 다름 — `first_post_created`는 1회만, `post_created`는 매번. 둘 다 유지 가능 |

→ 매핑 최종 결정은 B 단계(점심 후) 작업.

---

## 핵심지표 (PM ver.1.0)

**5개 KPI:**
- 월간 Uploader/User 비율
- 게시글 수 대비 반응 수 (댓글+공감+스크랩+다운로드 합)
- 30일 잔존율
- DAU/WAU/MAU
- WAU/MAU (Stickness)

**부가 지표:** 인증 완료 user 수, 월간 게시글>1 user 수, 월간 반응>5 user 수, 첨부 비율, 치료사 전용 비율, 반응 분류별 비율, 체류 시간(피드/글쓰기/마이페이지)

---

## B 단계에서 결정할 것

1. 기존 4종의 리네임/유지 매트릭스
2. 주요 7개 삽입 위치 매핑 (`profile_edited` = 어느 mutation? `screen_exit` = 어떤 hook?)
3. `reaction` 단일 이벤트 헬퍼 설계 (6곳 통합)
4. `screen_exit` duration 측정 패턴 (visibilitychange + route 변경)
