import { useEffect, useLayoutEffect } from 'react';
import type { RefObject } from 'react';

// SSR(prerender renderToString)에서는 useLayoutEffect가 경고를 내므로 useEffect로 대체.
// 클라이언트에서는 paint 직전 실행이 필요(깜빡임 방지)하므로 useLayoutEffect 유지.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * 컨테이너 안의 [data-animate] 요소를 스크롤 진입 시 페이드+슬라이드로 등장시킨다.
 *
 * progressive enhancement:
 * - 마크업에는 숨김 클래스를 넣지 않는다 → JS 비활성/검색봇/prerender는 콘텐츠를 그대로 본다(SEO 보호).
 * - JS가 동작할 때만 useLayoutEffect(paint 직전)에서 숨김 상태를 입혀 깜빡임 없이 시작한다.
 * - IntersectionObserver로 뷰포트 진입 시 1회 노출하고 관찰을 해제한다.
 */
export function useScrollReveal(containerRef: RefObject<HTMLElement | null>) {
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-animate]'));

    // 숨김 + 트랜지션 준비 (JS가 있을 때만 적용되므로 no-JS/봇은 영향 없음).
    els.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-6', 'transition-all', 'duration-700', 'ease-out');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.remove('opacity-0', 'translate-y-6');
          observer.unobserve(el);
        });
      },
      { threshold: 0.15 },
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef]);
}
