---
name: contentpreview-jira
description: "PostSummary.contentPreview에 \\n 미보존 (staging id:19 검증 2026-05-19). MSW 시뮬레이션 + 더보기 펼침 선구현, 백엔드 머지 후 환원 필요."
metadata: 
  node_type: memory
  type: project
  originSessionId: 6a4255e6-1481-4e7d-96e5-4c6e8f2479e2
---

**WHERE:** 백엔드 PostService(또는 매퍼) preview 생성 로직
**WHAT:** `GET /api/v1/posts` 응답의 `PostSummary.contentPreview`에 `\n`이 모두 strip돼서 한 덩어리 텍스트로 내려옴. 상세 `PostDetail.content`는 `\n` 보존 정상.
**BLOCKER:** Jira Task 등록 + 백엔드 작업/머지 대기

## 증거

staging id:19 응답 (2026-05-19):
```json
"contentPreview": "예술적 감각과 ... 창구가 되길 모집대상: 발달장애인 당사자 및 포함한 단체 모집기간: 5/18~5/29 모집규모: 12팀 행사일: 7/10 ..."
```
원본 본문(상세에선 줄바꿈 살아있음):
```
... 창구가 되길

모집대상: 발달장애인 당사자 및 포함한 단체
모집기간: 5/18~5/29
...
```

## 프론트 선구현 (commit `2d854a8`)

1. **MSW 시뮬레이션**:
   - `mocks/handlers/posts.handlers.ts:68` — `p.contentPreview` → `p.content` (백엔드 fix 가정)
   - `mocks/handlers/posts.handlers.ts:24` — mockFeedItems contentPreview를 멀티라인으로 보강
2. **PostCard 더보기 인라인 펼침** — X 패턴 (접기 없음, line-clamp-3 잘릴 때만 노출, `ResizeObserver`로 폰트/이미지 로딩 후 재측정)
3. **본문 영역 침범 방지** — `.post-content { overflow-wrap: anywhere; }` + PostCard `break-words` (`@` 100개 같은 공백 없는 긴 토큰 케이스)

## 백엔드 머지 후 액션 (잊지 말 것)

- `posts.handlers.ts:68` 의 `p.content` **→ `p.contentPreview` 로 환원** (주석에 명시해둠)
- 환원 후 staging에서 더보기/줄바꿈 정상 동작 재확인

## 관련

- Jira 초안: `jira_draft.md` 최상단 "[업로드 대기 2026-05-19] 피드 contentPreview에 줄바꿈(\n) 보존 (Task)"
- 백엔드 LLM 프롬프트 포함 정책: [[feedback_backend_llm_prompt]]
- 이슈 채널 정책: [[feedback_airo_issues_only]] (Jira 전환)
