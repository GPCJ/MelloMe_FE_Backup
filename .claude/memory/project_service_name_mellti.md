---
name: mellti-2026-05-14
description: "멜로미/MelloMe에서 Mellti로 브랜드 표기 일괄 변경 완료. 16 파일 27 라인, commit 7c391f0, main 머지 aaefd01, Vercel 자동 배포 트리거."
metadata: 
  node_type: memory
  type: project
  originSessionId: fb6b7655-3b51-48e2-b827-07464d491cc4
---

# 서비스 명칭 Mellti — 코드 반영 완료 (2026-05-14)

서비스 이름이 멜로미/MelloMe에서 **Mellti**로 변경되어 코드 일괄 반영 완료. **잠정에서 확정으로 승격.**

**Why:** 브랜드 표기가 멜로미/mellty/멜티 3종 혼재로 SEO 키워드 매칭이 분산되던 문제 + 시각 일관성 깨짐. PM이 신규 SEO 키워드 26종 카탈로그를 준비하기 시작한 시점([[pm-seo-keywords-2026-05-14]])에 표기 통일이 선행 과제로 부각.

**How to apply:** "Mellti"가 정식 표기. 한글 표기·옛 표기(멜로미/mellty/멜티)는 더 이상 사용하지 않음. 새 코드·문서·이슈·노션·Jira에서도 동일.

---

## 변경 정보

- **Commit**: `7c391f0` (chore(brand): 브랜드 표기 Mellti로 통일)
- **변경 범위**: 16 파일, 27 라인 (멜로미 20 + mellty 3 + 멜티 4)
- **Merge**: `aaefd01` main no-ff merge (cherry-pick 잔재로 fast-forward 불가 → 별도 노트 [[project_main_develop_force_sync_2026_05_11]])
- **Push**: `8a77c98..aaefd01` origin/main, Vercel 자동 배포 트리거

## 변경 대상 카테고리

1. **SEO 메타 (4 파일)**: `index.html`, `prerender.tsx`, `PrivacyPage.tsx`, `TermsPage.tsx`
   - prerender 산출물 `/`, `/privacy`, `/terms`의 title/description/og 메타 모두 Mellti
2. **사용자 화면 (5 파일)**: `LoginPage`, `SignupPage`, `PostListPage` 헤더, `WelcomeModal`, `VerificationCompletePage`
3. **코드 주석 (7 파일)**: `components/icons/*` — "Mellti 디자인 시안 아이콘"

## 잔여 작업

- **PM SEO 키워드 26종 메타 적용**: 2026-05-15 1순위 — [[pm-seo-keywords-2026-05-14]]
- **Google Search Console 색인 재요청**: 3 페이지 재색인 — [[reference_seo_consoles]]
- **Naver Search Advisor 등록 필요**
- 메모리·문서·노션·Jira에 남아 있는 "멜로미" 표기 점진 갱신

## 도메인 정합

도메인은 `melonnetherapists.com` 그대로 유지 (이전 브랜드 흔적). 향후 도메인 변경 시 redirect 작업 별도. 메타에 Mellti 박혀 있어서 SERP 매칭은 정상.
