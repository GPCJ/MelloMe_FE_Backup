/**
 * Mellti 랜딩 페이지 (비로그인 진입 화면).
 *
 * - Layout(공통 네비/사이드바) 밖 standalone. 자체 nav/footer를 가짐.
 * - `/` 라우트에 직결. 로그인 여부와 무관하게 모두에게 노출(로그인 유저는 nav로 /posts 이동).
 * - prerender 대상(`src/prerender.tsx`)이라 SSR 가능해야 함 → 초기 렌더는
 *   브라우저 전용 API(IntersectionObserver 등) 없이 정적으로 그려지도록 유지.
 *
 * Phase 1: 섹션 골격만. 각 섹션 내용은 이후 Phase에서 Tailwind로 채움.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      {/* Phase 2: 네비게이션 */}
      <nav id="nav" className="border-b border-neutral-200 p-4">[nav]</nav>

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
