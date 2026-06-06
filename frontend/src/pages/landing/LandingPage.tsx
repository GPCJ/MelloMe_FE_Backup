import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

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

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
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
                  <div className="mb-2.5 flex gap-[5px] overflow-hidden">
                    <span className="whitespace-nowrap rounded-full border border-neutral-900 bg-neutral-900 px-2.5 py-1 text-[0.6rem] font-medium text-white">
                      전체
                    </span>
                    {['감각통합', '언어치료', '작업치료'].map((c) => (
                      <span
                        key={c}
                        className="whitespace-nowrap rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[0.6rem] font-medium text-neutral-600"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  {/* 정렬 */}
                  <div className="mb-3 flex gap-2.5 text-[0.62rem] text-neutral-400">
                    <span className="rounded-full bg-neutral-100 px-2 py-[3px] font-semibold text-neutral-900">
                      최신순
                    </span>
                    <span>인기순</span>
                  </div>
                  {/* 고민카드 글 */}
                  <div className="border-b border-[#eeeeee] py-3">
                    <div className="mb-2 flex items-center gap-2 text-[0.72rem]">
                      <div className="h-7 w-7 rounded-full bg-neutral-300" />
                      <span className="font-semibold text-neutral-900">숨이는 귀엽다</span>
                      <span className="text-[0.6rem] text-neutral-400">1분 전</span>
                      <span className="ml-auto text-[0.8rem] text-neutral-300">☐</span>
                    </div>
                    <div className="mb-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <div className="mb-2.5 text-[0.72rem] font-bold text-neutral-700">❓ 고민카드</div>
                      <div className="mb-2.5">
                        {[
                          ['연령대', '유아기'],
                          ['치료영역', '감각통합'],
                          ['진단명', '자폐스펙트럼장애'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex gap-2.5 py-[3px] text-[0.62rem]">
                            <span className="min-w-[46px] font-semibold text-neutral-500">{label}</span>
                            <span className="text-neutral-700">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-neutral-200 pt-2 text-[0.65rem] leading-relaxed text-neutral-600">
                        <div className="mb-1 font-bold text-neutral-700">고민지점</div>
                        만 3세 asd 아동 조절 잡기 어려워서 글 씁니다
                      </div>
                    </div>
                    <div className="flex gap-3.5 text-[0.65rem] text-neutral-400">
                      <span>💬 0</span>
                      <span>♡</span>
                    </div>
                  </div>
                  {/* 일반 글 */}
                  <div className="py-3">
                    <div className="mb-2 flex items-center gap-2 text-[0.72rem]">
                      <div className="h-7 w-7 rounded-full bg-neutral-400" />
                      <span className="font-semibold text-neutral-900">햄스터#2727</span>
                      <span className="text-[0.6rem] text-neutral-400">8시간 전</span>
                      <span className="ml-auto text-[0.8rem] text-neutral-300">☐</span>
                    </div>
                    <p className="mb-2 text-[0.7rem] leading-relaxed text-neutral-600">
                      🚩 각 사이트별 최신 채용 공고 모음입니다!
                    </p>
                    <div className="flex gap-3.5 text-[0.65rem] text-neutral-400">
                      <span>💬 0</span>
                      <span>♡</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Phase 4: Feature ① 안전한 공간 / 인증 */}
        <section id="feature-safe" className="p-10">[feature-safe]</section>

        {/* Phase 5: Feature ② 고민카드 */}
        <section id="feature-worry" className="p-10">[feature-worry]</section>

        {/* Phase 6: Feature ③ 커뮤니티 기능 */}
        <section id="feature-community" className="p-10">[feature-community]</section>

        {/* Phase 7: CTA */}
        <section id="cta" className="p-10">[cta]</section>
      </main>

      {/* Phase 8: Footer */}
      <footer id="footer" className="border-t border-neutral-200 p-4">[footer]</footer>
    </div>
  );
}
