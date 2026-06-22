import { useEffect, useRef } from 'react';
import { trackEvent } from '../lib/analytics';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  useScrollDepth — 페이지 스크롤 깊이를 GA4 `landing_scrolled` 이벤트로 발송
 * ─────────────────────────────────────────────────────────────────────
 *  PM 스펙(2026-06-22 승인): 랜딩 페이지에서 유저가 어디까지 읽고 이탈하는지를
 *  25/50/75/100% 4개 임계점으로 추적합니다. 각 임계점은 한 번만 발사합니다
 *  (스크롤을 위아래로 반복해도 같은 depth가 중복 집계되지 않도록).
 *
 *  왜 useRef(Set)인가:
 *  - "이미 발사한 임계점"은 화면에 그려지는 값이 아니라 발송 제어용 플래그입니다.
 *    state로 두면 매 스크롤마다 setState → 불필요한 리렌더가 폭발합니다.
 *    ref는 리렌더 없이 값만 들고 있어 이 용도에 정확히 맞습니다.
 *
 *  계산식:
 *  - scrolled = window.scrollY + window.innerHeight  (현재 화면 하단의 문서상 위치)
 *  - total    = document.documentElement.scrollHeight (전체 문서 높이)
 *  - percent  = scrolled / total * 100
 *  - 즉 "화면 하단이 문서의 몇 %까지 내려왔는가" = 읽은 깊이.
 *    문서 끝까지 스크롤하면 scrolled === total → 100%.
 *
 *  passive 리스너:
 *  - { passive: true }는 "이 핸들러는 preventDefault를 호출하지 않는다"는 약속.
 *    브라우저가 스크롤을 기다리지 않고 즉시 처리해 스크롤 성능(jank)을 지킵니다.
 *
 *  throttle 불필요:
 *  - scroll은 고빈도 이벤트지만, 핸들러는 Set 조회 + 나눗셈 한 번뿐이라 가볍습니다.
 *    한 임계점은 Set 가드로 1회만 trackEvent를 호출하므로 발송 폭주도 없습니다.
 *
 *  초기 1회 호출:
 *  - 뷰포트보다 짧은 문서(또는 모바일에서 이미 하단까지 보이는 경우)는
 *    스크롤이 발생하지 않아 이벤트가 영영 안 뜰 수 있습니다.
 *    마운트 직후 handleScroll()을 한 번 불러 그 시점의 도달 깊이를 즉시 캡처합니다.
 *
 *  사용:
 *    function LandingPage() {
 *      useScrollDepth();
 *      // ...
 *    }
 * ─────────────────────────────────────────────────────────────────────
 */
const THRESHOLDS = [25, 50, 75, 100] as const;

export function useScrollDepth(): void {
  // 이미 발사한 임계점 집합. 마운트~언마운트 동안 유지되며 리렌더를 일으키지 않음.
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    function handleScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      // 0으로 나누기 방지(문서 높이가 0인 비정상 타이밍).
      if (total <= 0) return;
      const percent = (scrolled / total) * 100;

      for (const t of THRESHOLDS) {
        if (percent >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t); // 1회성 가드 — 같은 depth 재발송 차단.
          trackEvent('landing_scrolled', { depth: t });
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 도달 깊이 즉시 캡처(짧은 문서/모바일 대비).

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
