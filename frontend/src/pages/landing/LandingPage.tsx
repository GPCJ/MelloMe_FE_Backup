import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, PencilLine, LockOpen, MessageCircle, Heart } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * Mellti 랜딩 페이지 (비로그인 진입 화면).
 *
 * - Layout(공통 네비/사이드바) 밖 standalone. 자체 nav/footer를 가짐.
 * - `/` 라우트에 직결. 로그인 여부와 무관하게 모두에게 노출(로그인 유저는 nav로 /posts 이동).
 * - prerender 대상(`src/prerender.tsx`)이라 SSR 가능해야 함 → 초기 렌더는
 *   브라우저 전용 API(IntersectionObserver 등) 없이 정적으로 그려지도록 유지.
 *
 * 색상: 와이어프레임의 --gray-* 디자인 토큰은 Tailwind neutral-* 팔레트와 16진수까지 1:1.
 */
export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  return (
    <div ref={rootRef} className="min-h-screen bg-white font-sans text-neutral-900">
      {/* 상단 고정 네비게이션 (반투명 + blur). 높이 64px = h-16. */}
      <nav
        id="nav"
        className="fixed inset-x-0 top-0 z-50 h-16 border-b border-neutral-200 bg-white/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
          <Link to="/" className="text-[1.4rem] font-extrabold tracking-[-0.5px] text-neutral-900">
            Mellti
          </Link>
          <div className="flex items-center gap-4">
            {/* TODO(협업문의): 실제 타겟 미정 — 문의 폼/메일 주소 확정 후 연결 */}
            <a
              href="#"
              className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
            >
              협업문의
            </a>
            {user ? (
              <Link
                to="/posts"
                className="inline-flex items-center rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-700"
              >
                커뮤니티
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-700"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero — 좌측 카피/CTA + 우측 폰 목업. 900px↓ 1열 스택. */}
        <section
          id="hero"
          className="relative flex min-h-screen items-center overflow-hidden bg-white px-6 pb-[100px] pt-[124px] max-[480px]:pb-[60px] max-[480px]:pt-[94px]"
        >
          {/* 우측 상단 방향 은은한 radial 배경 (gray-100 → transparent) */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,#f5f5f5_0%,transparent_60%)]" />

          <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-2 items-center gap-[60px] max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[900px]:text-center">
            {/* 좌측: 카피 + CTA */}
            <div>
              <p
                data-animate
                className="mb-5 inline-block rounded-full border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-[0.85rem] font-medium text-neutral-500"
              >
                치료사 전용 커뮤니티
              </p>
              <h1
                data-animate
                className="mb-4 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.35] tracking-[-1px] text-neutral-900 max-[480px]:text-[1.65rem]"
              >
                아동발달재활 선생님들의
                <br />
                <span className="font-extrabold">모든 임상고민</span>이 여기에
              </h1>
              <p data-animate className="mb-7 text-[1.15rem] text-neutral-500">
                치료사들의 성장 바다, <strong className="font-bold text-neutral-900">Mellti</strong>
              </p>
              <div
                data-animate
                className="mb-9 flex flex-wrap gap-2.5 max-[900px]:justify-center"
              >
                {['💬 임상 고민', '📚 보수교육 정보', '💼 구직 정보'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-[18px] py-2 text-[0.88rem] font-medium text-neutral-500 transition-all hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link
                data-animate
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-9 py-[15px] text-base font-semibold text-white shadow-[0_2px_12px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)]"
              >
                지금 시작하기
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10h12m0 0l-4-4m4 4l-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* 우측: 폰 목업 (실제 피드 화면 흉내, 정적) */}
            <div data-animate className="relative flex justify-center">
              <div className="w-[300px] rounded-[28px] border border-neutral-200 bg-white p-2.5 shadow-[0_16px_48px_rgba(0,0,0,0.12)] max-[900px]:w-[260px]">
                <div className="mx-auto mb-2.5 mt-1 h-[5px] w-20 rounded-[10px] bg-neutral-200" />
                <div className="min-h-[460px] overflow-hidden rounded-[20px] border border-[#eeeeee] bg-white p-3.5">
                  <div className="pb-3 text-center text-[1.15rem] font-extrabold text-neutral-900">
                    Mellti
                  </div>
                  {/* 탭 */}
                  <div className="mb-3 flex border-b border-neutral-200">
                    <span className="flex-1 border-b-2 border-neutral-900 py-2 text-center text-[0.75rem] font-medium text-neutral-900">
                      전체 피드
                    </span>
                    <span className="flex-1 border-b-2 border-transparent py-2 text-center text-[0.75rem] font-medium text-neutral-400">
                      팔로우
                    </span>
                  </div>
                  {/* 필터 칩 */}
                  <div className="mb-2.5 flex gap-[5px] overflow-hidden border-b border-neutral-200 pb-2.5">
                    <span className="whitespace-nowrap rounded-full border border-neutral-900 bg-neutral-900 px-2.5 py-1 text-[0.6rem] font-medium text-white">
                      전체
                    </span>
                    {['감각통합', '언어치료', '작업치료'].map((c) => (
                      <span
                        key={c}
                        className="whitespace-nowrap rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[0.6rem] font-medium text-neutral-950"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  {/* 정렬 */}
                  <div className="mb-3 flex gap-2.5 border-b border-neutral-200 pb-2.5 text-[0.62rem] text-neutral-400">
                    <span className="rounded-full border border-neutral-900 bg-neutral-900 px-2 py-[3px] font-medium text-white">
                      최신순
                    </span>
                    <span className="rounded-full border border-neutral-300 px-2 py-[3px] text-neutral-500">
                      인기순
                    </span>
                  </div>
                  {/* 고민카드 글 */}
                  <div className="border-b border-[#eeeeee] py-3">
                    <div className="mb-2 flex items-center gap-2 text-[0.72rem]">
                      <div className="h-7 w-7 rounded-full bg-neutral-300" />
                      <span className="font-semibold text-neutral-900">숨이는 귀엽다</span>
                      <span className="text-[0.6rem] text-neutral-400">1분 전</span>
                      <svg
                        className="ml-auto h-3.5 w-3.5 text-neutral-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    </div>
                    <div className="mb-2 overflow-hidden rounded-xl border border-neutral-200">
                      {/* 헤더바 — 실제 ConcernCard와 동일(회색 바 + 원형 ? 뱃지) */}
                      <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50 px-3 py-2">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-800 text-[0.5rem] text-white">
                          ?
                        </span>
                        <span className="text-[0.72rem] font-bold text-neutral-700">고민카드</span>
                      </div>
                      <div className="px-3 py-2.5">
                        <div className="mb-2.5">
                          {[
                            ['연령대', '유아기'],
                            ['치료영역', '감각통합'],
                          ].map(([label, value]) => (
                            <div key={label} className="flex gap-2.5 py-[3px] text-[0.62rem]">
                              <span className="min-w-[46px] font-semibold text-neutral-500">{label}</span>
                              <span className="text-neutral-700">{value}</span>
                            </div>
                          ))}
                          {/* 진단명 — 실제처럼 칩(pill)로 */}
                          <div className="flex gap-2.5 py-[3px] text-[0.62rem]">
                            <span className="min-w-[46px] font-semibold text-neutral-500">진단명</span>
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700">
                              자폐스펙트럼장애
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-neutral-100 pt-2 text-[0.65rem] leading-relaxed text-neutral-600">
                          <div className="mb-1 font-bold text-neutral-700">고민지점</div>
                          만 3세 asd 아동 조절 잡기 어려워서 글 씁니다
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[0.65rem] text-neutral-400">
                      <span className="flex items-center gap-1 font-medium text-neutral-500">
                        <MessageCircle size={12} />0
                      </span>
                      <Heart size={13} />
                    </div>
                  </div>
                  {/* 일반 글 */}
                  <div className="py-3">
                    <div className="mb-2 flex items-center gap-2 text-[0.72rem]">
                      <div className="h-7 w-7 rounded-full bg-neutral-400" />
                      <span className="font-semibold text-neutral-900">햄스터#2727</span>
                      <span className="text-[0.6rem] text-neutral-400">8시간 전</span>
                      <svg
                        className="ml-auto h-3.5 w-3.5 text-neutral-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    </div>
                    <p className="mb-2 text-[0.7rem] leading-relaxed text-neutral-600">
                      🚩 각 사이트별 최신 채용 공고 모음입니다!
                    </p>
                    <div className="flex items-center gap-3 text-[0.65rem] text-neutral-400">
                      <span className="flex items-center gap-1 font-medium text-neutral-500">
                        <MessageCircle size={12} />0
                      </span>
                      <Heart size={13} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature ① 안전한 공간 / 인증 — 좌: 인증 화면 목업, 우: 텍스트. 900px↓ 1열(텍스트 먼저). */}
        <section
          id="feature-safe"
          className="relative bg-white px-6 py-[120px] max-[480px]:px-5 max-[480px]:py-20"
        >
          <div className="mx-auto grid max-w-[1100px] grid-cols-2 items-center gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-12">
            {/* 좌: 인증 화면 목업 */}
            <div data-animate className="max-[900px]:order-2 max-[900px]:flex max-[900px]:justify-center">
              <div className="w-[300px] rounded-[28px] border border-neutral-200 bg-white p-2.5 shadow-[0_16px_48px_rgba(0,0,0,0.12)] max-[900px]:w-[260px]">
                <div className="mx-auto mb-2.5 mt-1 h-[5px] w-20 rounded-[10px] bg-neutral-200" />
                <div className="min-h-[460px] overflow-hidden rounded-[20px] border border-[#eeeeee] bg-white p-3.5">
                  {/* 실제 TherapistVerificationPage 화면 축소 재현 */}
                  <div className="mb-3 flex items-center gap-1.5">
                    <ArrowLeft size={12} className="text-neutral-400" />
                    <span className="text-[0.8rem] font-bold text-neutral-900">치료사 인증</span>
                  </div>
                  <div className="mb-3">
                    <div className="text-[0.7rem] font-bold text-neutral-900">치료사 인증 페이지</div>
                    <p className="text-[0.55rem] text-neutral-500">
                      치료사 자격증을 인증하고 전문 치료사로 활동해보세요.
                    </p>
                  </div>
                  {/* 면허번호 */}
                  <div className="mb-2.5">
                    <div className="mb-1 text-[0.6rem] font-semibold text-neutral-700">
                      면허번호 <span className="text-red-500">*</span>
                    </div>
                    <div className="rounded-md border border-neutral-200 px-2 py-1.5 text-[0.58rem] text-neutral-400">
                      면허번호를 입력해주세요
                    </div>
                  </div>
                  {/* 면허증 첨부 */}
                  <div className="mb-2.5">
                    <div className="mb-1 text-[0.6rem] font-semibold text-neutral-700">
                      준비물: 면허증 첨부 <span className="text-red-500">*</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-md border-2 border-dashed border-neutral-200 py-3 text-neutral-400">
                      <Upload size={14} />
                      <span className="text-[0.55rem]">파일을 선택하거나 드래그하세요</span>
                      <span className="text-[0.5rem] text-neutral-300">JPG, PNG, WEBP (최대 5MB)</span>
                    </div>
                  </div>
                  {/* 치료영역 (9개, 3열, 중복 선택) */}
                  <div className="mb-3">
                    <div className="text-[0.6rem] font-semibold text-neutral-700">
                      추가 수집 정보: 치료영역 <span className="text-red-500">*</span>
                    </div>
                    <p className="mb-1.5 text-[0.5rem] text-neutral-400">
                      인정하시는 치료 영역을 선택하세요 (중복 선택 가능)
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        ['감각통합', true],
                        ['언어치료', true],
                        ['작업치료', false],
                        ['인지치료', false],
                        ['물리치료', false],
                        ['미술치료', false],
                        ['음악치료', false],
                        ['놀이치료', false],
                        ['행동치료', false],
                      ].map(([area, selected]) => (
                        <span
                          key={area as string}
                          className={`rounded-md border py-1 text-center text-[0.52rem] font-medium ${
                            selected
                              ? 'border-neutral-900 bg-neutral-900 text-white'
                              : 'border-neutral-200 bg-white text-neutral-600'
                          }`}
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* 버튼 (취소 / 인증 신청하기 violet) */}
                  <div className="flex gap-1.5">
                    <div className="flex-1 rounded-md border border-neutral-200 py-1.5 text-center text-[0.6rem] font-medium text-neutral-600">
                      취소
                    </div>
                    <div className="flex-1 rounded-md bg-violet-500 py-1.5 text-center text-[0.6rem] font-medium text-white">
                      인증 신청하기
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우: 텍스트 */}
            <div data-animate className="max-[900px]:order-1">
              <span className="mb-4 inline-block rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-[5px] text-[0.8rem] font-semibold text-neutral-500">
                안전한 전문가 공간
              </span>
              <h2 className="mb-4 text-[clamp(1.6rem,3vw,2.3rem)] font-extrabold leading-[1.35] tracking-[-0.5px] text-neutral-900">
                치료사들만의
                <br />
                <span className="font-extrabold">안전한 공간</span>
              </h2>
              <p className="mb-8 text-base leading-[1.8] text-neutral-500">
                면허증 인증을 통해 검증된 치료사만 접근할 수 있는 전문가 커뮤니티입니다. 인증 회원은 닉네임
                옆에 치료영역이 표시되어, 신뢰할 수 있는 동료와 소통하세요.
              </p>
              <ul className="flex flex-col gap-5">
                {[
                  ['🔐', '면허증 기반 인증', '치료사 자격을 증빙하여 인증 회원 등급을 획득'],
                  ['🏷️', '치료영역 표시', 'ST, OT, PT 등 전문 분야가 닉네임과 함께 표시'],
                  ['👁️', '단계별 접근 권한', '인증 등급에 따라 열람 가능한 게시글이 달라져요'],
                ].map(([icon, title, desc]) => (
                  <li key={title} className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-[1.2rem]">
                      {icon}
                    </span>
                    <div>
                      <strong className="mb-0.5 block text-[0.95rem] font-semibold">{title}</strong>
                      <p className="text-[0.85rem] leading-[1.5] text-neutral-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Feature ② 고민카드 — 좌: 텍스트, 우: 실제 고민카드 작성 폼. bg-secondary. 900px↓ 1열(텍스트 먼저). */}
        <section
          id="feature-worry"
          className="relative bg-neutral-50 px-6 py-[120px] max-[480px]:px-5 max-[480px]:py-20"
        >
          <div className="mx-auto grid max-w-[1100px] grid-cols-2 items-center gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-12">
            {/* 좌: 텍스트 */}
            <div data-animate>
              <span className="mb-4 inline-block rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-[5px] text-[0.8rem] font-semibold text-neutral-500">
                임상 고민 해결
              </span>
              <h2 className="mb-4 text-[clamp(1.6rem,3vw,2.3rem)] font-extrabold leading-[1.35] tracking-[-0.5px] text-neutral-900">
                혼자 고민하던 치료,
                <br />
                <span className="font-extrabold">이제 그만</span>
              </h2>
              <p className="mb-8 text-base leading-[1.8] text-neutral-500">
                고민카드를 작성하면 동료 치료사들의 경험과 노하우를 얻을 수 있어요. 연령대, 진단명,
                치료영역별로 구조화된 폼으로 정확한 도움을 받아보세요.
              </p>
              <ul className="flex flex-col gap-5">
                {[
                  ['🧩', '구조화된 고민카드', '연령대, 진단명, 치료영역을 포함한 체계적인 작성 폼'],
                  ['💡', '동료의 실전 경험', '댓글과 리액션으로 다양한 중재 전략을 공유'],
                  ['📌', '스크랩 & 아카이빙', '유용한 게시글은 스크랩하여 마이페이지에서 보관'],
                ].map(([icon, title, desc]) => (
                  <li key={title} className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-[1.2rem]">
                      {icon}
                    </span>
                    <div>
                      <strong className="mb-0.5 block text-[0.95rem] font-semibold">{title}</strong>
                      <p className="text-[0.85rem] leading-[1.5] text-neutral-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 우: 실제 ConcernForm 화면 축소 재현 (순서: 연령대→치료영역→진단명→고민지점) */}
            <div data-animate className="flex justify-center">
              <div className="w-[300px] rounded-[28px] border border-neutral-200 bg-white p-2.5 shadow-[0_16px_48px_rgba(0,0,0,0.12)] max-[900px]:w-[260px]">
                <div className="mx-auto mb-2.5 mt-1 h-[5px] w-20 rounded-[10px] bg-neutral-200" />
                <div className="min-h-[460px] overflow-hidden rounded-[20px] border border-[#eeeeee] bg-white p-3.5">
                  {/* 헤더 — ← [일반 글 | 고민 카드] ✏️ */}
                  <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2">
                    <ArrowLeft size={12} className="text-neutral-700" />
                    <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 text-[0.5rem]">
                      <span className="rounded-md px-2 py-1 text-neutral-500">일반 글</span>
                      <span className="rounded-md bg-white px-2 py-1 font-semibold text-neutral-900 shadow-sm">
                        고민 카드
                      </span>
                    </div>
                    <PencilLine size={12} className="text-neutral-900" />
                  </div>
                  <div className="flex flex-col gap-3">
                    {/* 연령대 */}
                    <div>
                      <div className="mb-1 text-[0.6rem] font-semibold text-neutral-800">연령대</div>
                      <div className="flex flex-wrap gap-1">
                        {['영아기', '유아기', '아동기', '청소년기', '성년기', '노령기'].map((c) => (
                          <span
                            key={c}
                            className={`rounded-full border px-2 py-0.5 text-[0.52rem] font-medium ${
                              c === '유아기'
                                ? 'border-neutral-900 bg-neutral-900 text-white'
                                : 'border-neutral-200 bg-white text-neutral-700'
                            }`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* 치료영역 */}
                    <div>
                      <div className="mb-1 text-[0.6rem] font-semibold text-neutral-800">치료영역</div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          '감각통합',
                          '언어치료',
                          '작업치료',
                          '인지치료',
                          '물리치료',
                          '미술치료',
                          '음악치료',
                          '놀이치료',
                          '행동치료',
                        ].map((c) => (
                          <span
                            key={c}
                            className={`rounded-full border px-2 py-0.5 text-[0.52rem] font-medium ${
                              c === '감각통합'
                                ? 'border-neutral-900 bg-neutral-900 text-white'
                                : 'border-neutral-200 bg-white text-neutral-700'
                            }`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* 진단명 */}
                    <div>
                      <div className="mb-1 text-[0.6rem] font-semibold text-neutral-800">진단명</div>
                      <div className="mb-1 flex flex-wrap gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[0.52rem] text-neutral-800">
                          자폐스펙트럼장애 <span className="text-neutral-500">×</span>
                        </span>
                      </div>
                      <div className="rounded-md border border-neutral-200 px-2 py-1.5 text-[0.55rem] text-neutral-400">
                        진단명을 입력하세요
                      </div>
                    </div>
                    {/* 고민지점 */}
                    <div>
                      <div className="mb-1 text-[0.6rem] font-semibold text-neutral-800">고민지점</div>
                      <div className="min-h-[44px] rounded-md border border-neutral-200 px-2 py-1.5 text-[0.55rem] leading-relaxed text-neutral-600">
                        만 3세 asd 아동 조절 잡기 어려워서 글 씁니다. 넓은 곳 달리기만 하고 치료실 내에서
                        소리를 지르거나…
                      </div>
                      <p className="mt-0.5 text-right text-[0.5rem] text-neutral-400">52 / 2000</p>
                    </div>
                  </div>
                  {/* 푸터 — 공개범위 + 작성 완료 */}
                  <div className="mt-3 flex items-center border-t border-neutral-100 pt-2">
                    <span className="flex items-center gap-1 text-[0.55rem] text-neutral-700">
                      전체 공개 <LockOpen size={10} />
                    </span>
                    <div className="flex-1" />
                    <span className="rounded-md border border-neutral-900 bg-neutral-900 px-3 py-1 text-[0.55rem] font-semibold text-white">
                      작성 완료
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature ③ 커뮤니티 기능 — 좌: 카드 4개 스택, 우: 텍스트. 900px↓ 1열(텍스트 먼저). */}
        <section
          id="feature-community"
          className="relative bg-white px-6 py-[120px] max-[480px]:px-5 max-[480px]:py-20"
        >
          <div className="mx-auto grid max-w-[1100px] grid-cols-2 items-center gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-12">
            {/* 좌: 기능 카드 4개 (2x2) */}
            <div data-animate className="max-[900px]:order-2 max-[900px]:flex max-[900px]:justify-center">
              <div className="mx-auto grid max-w-[380px] grid-cols-2 gap-3.5 max-[480px]:max-w-[280px]">
                {[
                  ['💬', '1:1 메시지', '동료 치료사와 직접 소통'],
                  ['🔔', '실시간 알림', '댓글, 리액션, DM 알림'],
                  ['👥', '팔로우 피드', '관심 치료사의 글만 모아보기'],
                  ['🔄', '리포스트', '유용한 글을 공유하고 인용'],
                ].map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="rounded-[20px] border border-neutral-200 bg-white px-[18px] py-7 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1.5 hover:border-neutral-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] max-[480px]:px-3 max-[480px]:py-5"
                  >
                    <div className="mb-2.5 text-[1.8rem]">{icon}</div>
                    <h4 className="mb-1 text-[0.88rem] font-bold text-neutral-800">{title}</h4>
                    <p className="text-[0.75rem] text-neutral-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 우: 텍스트 */}
            <div data-animate className="max-[900px]:order-1">
              <span className="mb-4 inline-block rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-[5px] text-[0.8rem] font-semibold text-neutral-500">
                커뮤니티 기능
              </span>
              <h2 className="mb-4 text-[clamp(1.6rem,3vw,2.3rem)] font-extrabold leading-[1.35] tracking-[-0.5px] text-neutral-900">
                치료사를 위한
                <br />
                <span className="font-extrabold">모든 기능</span>
              </h2>
              <p className="mb-8 text-base leading-[1.8] text-neutral-500">
                팔로우, 메시지, 리포스트 등 커뮤니티에 필요한 모든 기능을 갖추고 있어요. 같은 고민을
                나누는 동료를 찾고, 함께 성장하세요.
              </p>
              <ul className="flex flex-col gap-5">
                {[
                  ['❤️', '3종 리액션', '좋아요, 유용해요, 궁금해요로 감정 표현'],
                  ['⏳', '휘발성 게시글', '일정 시간 후 자동 삭제되는 게시글 기능'],
                ].map(([icon, title, desc]) => (
                  <li key={title} className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-[1.2rem]">
                      {icon}
                    </span>
                    <div>
                      <strong className="mb-0.5 block text-[0.95rem] font-semibold">{title}</strong>
                      <p className="text-[0.85rem] leading-[1.5] text-neutral-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA — 다크 배경 + 반전 버튼 */}
        <section
          id="cta"
          className="relative overflow-hidden bg-neutral-900 px-6 py-[120px] text-center text-white max-[480px]:px-5 max-[480px]:py-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
          <div data-animate className="relative z-10">
            <h2 className="mb-4 text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold leading-[1.35] tracking-[-0.5px]">
              임상 현장의 고민,
              <br />
              이제 <span className="text-neutral-300">Mellti</span>에서 나누세요
            </h2>
            <p className="mb-9 text-[1.05rem] text-neutral-400">
              전국의 치료사 동료들이 기다리고 있어요
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-9 py-[15px] text-base font-semibold text-neutral-900 shadow-[0_2px_16px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-0.5 hover:bg-neutral-100 hover:shadow-[0_6px_30px_rgba(255,255,255,0.15)]"
            >
              로그인하러 가기
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10h12m0 0l-4-4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer — 브랜드 + 링크 + 회사 정보 */}
      <footer id="footer" className="border-t border-neutral-200 bg-neutral-50 px-6 pb-8 pt-12">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[1.4rem] font-extrabold tracking-[-0.5px] text-neutral-900">
                Mellti
              </span>
              <p className="text-[0.85rem] text-neutral-400">치료사들의 성장 바다</p>
            </div>
            <div className="flex items-center gap-5">
              <Link
                to="/terms"
                className="text-[0.85rem] text-neutral-400 transition-colors hover:text-neutral-900"
              >
                이용약관
              </Link>
              <Link
                to="/privacy"
                className="text-[0.85rem] text-neutral-400 transition-colors hover:text-neutral-900"
              >
                개인정보 처리방침
              </Link>
              {/* TODO(인스타): 아이로 공식 인스타그램 URL 확정 후 href 연결 */}
              <a
                href="#"
                aria-label="아이로 인스타그램"
                className="text-neutral-400 transition-colors hover:text-neutral-900"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-5">
            {/* TODO(사업자번호): 실제 사업자등록번호 확정 후 교체 */}
            <p className="text-[0.78rem] leading-[1.8] text-neutral-400">
              주식회사 아이로 | 사업자등록번호: 000-00-00000
            </p>
            <p className="text-[0.78rem] leading-[1.8] text-neutral-400">
              © 2026 Airo Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
