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
        {/* Phase 3: Hero (폰 목업 포함) */}
        <section id="hero" className="p-10">[hero]</section>

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
