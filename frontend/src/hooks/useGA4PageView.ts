import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  전역 타입 선언 (declare global)
 * ─────────────────────────────────────────────────────────────────────
 *  index.html의 GA4 스니펫은 `window.gtag`라는 함수를 전역에 주입한다.
 *  TS는 HTML 런타임 주입을 모르니, "window에 gtag라는 함수가 있을 수 있다"
 *  고 타입 수준에서 알려줘야 `window.gtag(...)`가 컴파일된다.
 *
 *  `declare global`은 "이 선언을 전역 네임스페이스에 올린다"는 뜻.
 *  `interface Window`는 브라우저 내장 Window 인터페이스를 확장 선언해
 *  gtag 프로퍼티를 추가한다. `?`는 "없을 수도 있음"을 의미 (애드블로커
 *  로 GA가 차단된 환경 대응).
 * ─────────────────────────────────────────────────────────────────────
 */
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetOrEventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────
 *  useGA4PageView — SPA 라우트 변경 시마다 GA4 page_view 이벤트 발송
 * ─────────────────────────────────────────────────────────────────────
 *  왜 필요한가:
 *  - `gtag('config', ID)`는 "스크립트 최초 실행 시점" 1회만 page_view 자동 발송.
 *  - React Router의 navigate는 브라우저를 재로드하지 않고 URL만 바꿈(=SPA 특성).
 *  - 따라서 GA4는 사용자가 첫 페이지에만 머문 것처럼 집계 → 유입/퍼널 분석 망가짐.
 *
 *  해결:
 *  - `useLocation`으로 현재 경로를 구독.
 *  - `useEffect`의 의존성 배열에 `pathname/search`를 넣어 경로 변경 시마다 재실행.
 *  - 매번 `gtag('event', 'page_view', {...})`를 호출해 GA4에 명시적으로 알림.
 *
 *  주의:
 *  - 이 훅은 반드시 <BrowserRouter> **내부**에서 호출해야 한다.
 *    (useLocation이 Router context를 요구함 → App 최상단에서 직접 호출 X)
 *  - 따라서 App.tsx에서는 <AnalyticsTracker /> 같은 래퍼 컴포넌트를
 *    BrowserRouter 자식으로 두고, 그 안에서 이 훅을 호출한다.
 * ─────────────────────────────────────────────────────────────────────
 */
export function useGA4PageView() {
  const location = useLocation();

  useEffect(() => {
    // 애드블로커/Clarity 차단/네트워크 오류 등으로 GA 스크립트가 로드 안 됐을 때
    // window.gtag가 undefined이므로 가드로 바로 리턴 (런타임 에러 방지).
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      // page_path: 쿼리스트링 포함한 상대 경로 (예: "/posts?tag=ABA")
      page_path: location.pathname + location.search,
      // page_location: 프로토콜·도메인 포함 전체 URL (GA 리포트에서 구분자로 사용)
      page_location: window.location.href,
      // page_title: 문서의 현재 <title>. SPA에서 제목이 라우트별로 바뀐다면 중요.
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
  //  ↑ 의존성 배열: pathname OR search가 바뀔 때만 effect 재실행.
  //    location 객체 전체를 넣으면 매 렌더마다 새 참조라 불필요한 재실행 발생.
}
