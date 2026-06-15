---
name: 랜딩페이지 부활 (2026-06-06, 구 폐기 2026-05-06)
description: 랜딩 부활. `/`는 로그인 여부 무관 LandingPage. Mellti 마케팅 랜딩 + 폰 목업 3종. 2026-05-06 폐기 결정은 뒤집힘.
type: project
originSessionId: ae7aa7da-b987-4cb5-af3d-71635929aad2
---
**2026-06-06 부활(현행).** 팀 결정으로 랜딩 재도입. 목적 = SEO 향상 + 비로그인 진입 콘텐츠(랜딩 자체). 아래 2026-05-06 폐기 결정은 **뒤집혔다** — 랜딩 추가 요청을 더는 거절하지 않는다.

**부활 결정 (2026-06-06, `feat/landing-page` PR):**
- `/` 라우트 = `LandingPage` 직결. **로그인 여부와 무관하게 모두 랜딩 노출**(로그인 유저는 nav "커뮤니티"로 `/posts`). `RootRedirect` 삭제.
- 브랜드/서비스명 = **Mellti**, 회사 = **주식회사 아이로**(도메인은 그대로 melonnetherapists).
- PM 와이어프레임(HTML/CSS) 기반, **Tailwind 전면 재작성**(와이어프레임 `--gray-*` 토큰 = Tailwind `neutral-*` 16진수 1:1). 구조: Nav→Hero(폰 목업)→Feature①인증→Feature②고민카드→Feature③커뮤니티→CTA→Footer.
- **폰 목업 3종은 실제 화면 재현**: Hero 피드, Feature① `TherapistVerificationPage`(면허번호/면허증 첨부/치료영역 9칩/violet 버튼), Feature② `ConcernForm`(연령대→치료영역→진단명→고민지점 순, 헤더 토글, 푸터 공개범위+작성완료).
- **SEO**: `prerender.tsx` `/` 본체를 `SeoRoot`(sr-only 해킹)에서 실제 `LandingPage`로 교체. 기존 PM 롱테일 키워드는 `SeoKeywords` sr-only 블록으로 **prerender HTML에만** 보존(클라 SPA 미노출).
- **애니메이션**: `useScrollReveal`(IntersectionObserver) — progressive enhancement(마크업은 기본 보임, JS 있을 때만 숨김→등장. 봇/no-JS/prerender는 전부 보임). Tailwind 동적 클래스 purge 생존 빌드 검증 완료.
- 후속 미확정: placeholder 3개(협업문의·인스타 URL·사업자번호) + Feature③ 미구현 기능 카피 갭 → backlog `F-11`.

**2026-06-07 — develop 머지 완료(PR #24, merge commit `ccbf982`).** 머지 전 리뷰에서 Hero 폰 목업이 실제 `/posts`와 어긋난 점 정합: 북마크 아이콘(☐→lucide Bookmark), 댓글/하트(이모지→lucide MessageCircle/Heart), 고민카드(인라인 ❓→회색 헤더바+원형 ? 뱃지, 실제 `ConcernCard` 구조), 진단명(평문→pill 칩), 정렬칩 명암(active=검정bg/흰글씨), 필터/정렬 `border-b` 구분선. 추상 카드 이모지는 예외로 유지.
- **인증뱃지 죽은코드 제거 결정**: 백엔드 `/posts`·`/posts/feed` 응답에 `authorVerificationStatus` 필드 자체가 없어 항상 미렌더 → `PostCard`·`PostDetailPage`·`CommentWritePage` 3곳 `VerifiedBadge` 사용+import 삭제. `authorRole`/`user.therapistVerification` 기반 살아있는 경로(CommentCard·CommentReplyModal·PostWriteForm)는 유지. 타입(`types/post.ts`)·MSW 목 데이터는 백엔드 필드 추가 시 부활 위해 **보존**. → Feature① "닉네임과 함께 인증 표시" 카피가 현재 실동작과 불일치(카피갭 `F-11`).
- `feat/landing-page` 브랜치 로컬·원격 삭제 완료. 후속 F-11은 이번 미진행(2026-06-07).

**2026-06-07 — 랜딩은 운영(main/airo/prod) 보류, develop/staging 전용 상태로 확정.** 처음엔 develop→main 전량 머지(`2cb35cc`) 후 origin+airo push했으나, 사용자가 "랜딩까지 운영 적용돼버렸다"며 롤백 요청 → **랜딩만 제외 재적용**.
- **제외 기법**: 랜딩 PR 머지커밋의 첫 부모(`ccbf982^1` = `5f2d91f`, 랜딩 직전 develop tip)를 main에 머지. revert 흔적 없이 랜딩이 처음부터 없는 깨끗한 히스토리. 머지 자체는 충돌 0건(예측한 PostCard 충돌도 자동 회피), tsc 통과.
- 결과: main = `ddc46b0`(force-with-lease로 `2cb35cc` 덮어씀), airo `7181b67`(force). 랜딩 8파일(LandingPage·useScrollReveal·prerender 랜딩본·RootRedirect 복원 등 + 묶여있던 `190783b` authorVerificationStatus 죽은코드 제거)만 빠지고 쪽지/linkify/더보기 재설계/NarrowPage 등 나머지 전부 유지.
- **develop은 랜딩 보존**. 재적용 트리거: 운영에 랜딩 올릴 준비되면 `develop→main` 재머지 → 자동 복귀. 백업 브랜치 `main-backup-before-merge-2026-06-07`(랜딩 직전) 잔존.
- 배포 검증: prod(main)=랜딩 없음, staging(develop)=랜딩 있음 = 의도대로. 관련 [[feedback_offer_partial_scope_on_merge]].

**2026-06-08 — PM footer 수정 요청 반영(develop only). F-11 placeholder 3종 해소.** 커밋 `d086a2d`, `origin/develop` push. `LandingPage.tsx` 단일 파일.
- placeholder 실값 기입: 사업자등록번호 `394-87-03655`, 통신판매번호 `2026-서울광진-0955`(신규 추가), 협업문의 nav `href`→채널톡(카카오) `https://pf.kakao.com/_qxfBAX`, footer 인스타→`https://www.instagram.com/airo_officially/`(둘 다 `target=_blank rel=noopener`). → F-11 placeholder 3종 닫힘. 남은 F-11 = Feature③ 미구현 기능 카피갭 + 인증뱃지 카피갭.
- **버튼 auth 분기 추가**(QA 지적): 히어로 "지금 시작하기" `to="/signup"` 고정 → `to={user ? '/posts' : '/login'}`. CTA "로그인하러 가기" `/login` 고정 → 목적지+텍스트 동시 분기(`user ? '/posts'+'커뮤니티 둘러보기' : '/login'+'로그인하러 가기'`). nav가 이미 쓰던 `user` 그대로 재사용.

**2026-06-08 — 랜딩 운영(main/prod) 배포 완료. 06-07 보류 뒤집힘.** 팀 컴펌으로 운영 적용 의사결정 → `develop→main` 재머지(no-ff merge commit, `ddc46b0..216e769`), `origin/main` push로 Vercel main→prod 자동 배포 트리거. 06-07에 박제한 "재적용 트리거: develop→main 재머지" 그대로 실행됨.
- 머지 클린(merge-tree 사전 확인 + 실제 머지 모두 충돌 0건). 경고됐던 체리픽 중복(고민카드 푸터·이미지 재시도) 충돌 미발생. tsc -b 통과 후 push.
- 함께 올라간 것 = 랜딩 일체(LandingPage·useScrollReveal·prerender 랜딩본·RootRedirect 삭제 등) + `190783b` authorVerificationStatus 죽은코드 제거. 06-07에 빠졌던 8파일이 그대로 복귀.
- 이제 main/develop 모두 랜딩 보유. 남은 카피갭 = backlog `F-11`(Feature③ 미구현 기능 카피 + 인증뱃지 카피), PM 소유 passive.

---

## (구) 폐기 결정 — 2026-05-06, 역사 참조용 (현재 무효)

랜딩페이지 폐기. `/` 라우트는 분기 redirect로 교체. 회사 소개형 랜딩은 다시 만들지 않음.

**결정 (2026-05-06):**
- `/` 라우트: `RootRedirect` 컴포넌트로 교체 (비로그인→`/signup`, 로그인→`/posts`)
- `LandingPage` 컴포넌트 폐기 (import 제거 OK, 코드 보존 불필요)
- `sitemap.xml`에서 `/` 항목 제거 또는 `/signup`으로 갱신
- 회사 소개형 랜딩 페이지는 향후에도 만들지 않음. 마케팅용 페이지 필요 시 `/about` 등 별도 정적 페이지로 분리.

**Why:**
- **X/Threads 패턴 정합** — 두 서비스 모두 메인 도메인에 회사 소개 랜딩 없음. 비로그인 시 콘텐츠 미리보기 + 로그인 모달이 표준. 회사 소개는 `about.x.com` 같은 별도 도메인.
- **타겟이 정보 추구형 전문가** — 치료사는 "이 서비스 뭐하는 곳?" 카피보다 "여기 어떤 글이 오가는지" 콘텐츠 자체가 더 큰 신뢰 신호. 자랑 카피 페이지의 ROI 낮음.
- **MVP 정책이 이미 콘텐츠 우선 정렬** — 비인증 공개글 열람 허용 정책이 박혀 있어 X/Threads형 진입 흐름이 백엔드 레벨에서 이미 준비됨.
- **모바일 우선 + 콘텐츠 우선 커뮤니티 모델과 충돌** — 회사 소개형 랜딩은 본질적으로 PC 대형 스크린 + 큰 사진 + 스크롤 마케팅 페이지. 모바일/PC 둘 다 강조하는 X/Threads형 UI와 결이 다름. 디자인·구현 시간 ROI 낮음.
- **트렌드** — 모달 가입/소셜 로그인으로 빠른 유저 식별이 현대 SNS/커뮤니티 표준 패턴.

**How to apply:**
- 랜딩 페이지 추가/복구 요청 시 이 결정 환기. "왜 다시 만들어야 하는지" 새 근거 없으면 거절.
- 마케팅·포트폴리오용 페이지가 정말 필요하면 `/about` 별도 정적 페이지 한 장으로 분리. 메인 도메인 진입 흐름은 건드리지 않음.
- **베타 종료 후 진입 흐름 전환 로드맵**: `/` → 콘텐츠 미리보기(`/posts` 공개글 + 미인증 블러 + 로그인 유도) X/Threads 패턴. 선결 조건은 백엔드 visibility 정책 + 디자이너 D-07 블러 UI 시안.
- SEO 영향: 브랜드 검색 1위 충족은 `<title>`/메타/sitemap만으로 가능 (랜딩 불필요). 검색결과 클릭 시 첫 화면이 회원가입 폼이라 일반 대중 클릭률은 낮을 수 있음 — 클로즈 베타 단계라 영향 미미.
