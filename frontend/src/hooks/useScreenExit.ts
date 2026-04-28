import { useEffect, useRef } from 'react';
import { trackEvent, type ScreenName } from '../lib/analytics';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  useScreenExit — 페이지 체류 시간을 GA4 `screen_exit` 이벤트로 발송
 * ─────────────────────────────────────────────────────────────────────
 *  PM 정식 스펙(2026-04-27): 피드/글쓰기/마이페이지 3개 화면의 체류 시간을
 *  부가 KPI로 추적합니다. 이 훅은 한 페이지에서 다음 3가지 "이탈" 신호를
 *  통합해 단일 진입점으로 발송합니다.
 *
 *  이탈 신호 3종:
 *  1) 라우트 변경 (예: /posts → /profile)
 *     React 라우팅에서 컴포넌트가 unmount → useEffect cleanup이 트리거.
 *  2) 탭 숨김 (visibilitychange → hidden)
 *     다른 탭으로 전환, 모바일 홈으로 이동, 화면 잠금 등.
 *  3) 탭/브라우저 닫기 (beforeunload)
 *     X 버튼, Cmd+W. (모바일에서는 잘 발화 안 되지만 백업으로 둠.)
 *
 *  duration 측정 패턴:
 *  - mount 시 Date.now()를 ref에 저장.
 *  - 발송 시 (Date.now() - ref) 계산 후 ref를 현재 시각으로 갱신해
 *    "다음 구간"의 시작점으로 재사용 (visible 복귀 시 자연스럽게 이어짐).
 *  - 1초 미만 노이즈는 발송 생략 (라우트 빠른 클릭, dev StrictMode 더블 마운트 등).
 *
 *  beacon 전송:
 *  - `beforeunload` 핸들러에서 일반 fetch는 브라우저가 기다려주지 않아 유실 위험.
 *  - GA4 표준: `transport_type: 'beacon'` 파라미터를 넘기면 gtag가 내부적으로
 *    `navigator.sendBeacon`을 사용 → 탭이 닫힌 후에도 전송 큐가 유지됨.
 *  - hidden / cleanup 케이스에도 동일하게 beacon을 써서 일관된 전송 보장.
 *
 *  주의 — 중복 발송 가능성:
 *  - 탭 hidden → 탭 close 흐름에서 visibility hidden 이벤트가 한 번 발송하고
 *    뒤이어 beforeunload가 또 발송할 수 있습니다. 이때 두 번째 호출의 duration은
 *    1초 미만일 가능성이 높아 위 노이즈 필터로 자동 컷됩니다 (대부분의 경우).
 *  - 완전 차단은 안 하는 이유: 한 가지 신호만 신뢰하면 케이스별로 누락이 생겨
 *    "총합 기준" 분석 시 더 큰 손실. 약간의 중복이 누락보다 안전합니다.
 *
 *  사용:
 *    function PostListPage() {
 *      useScreenExit('feed');
 *      // ... 페이지 로직
 *    }
 * ─────────────────────────────────────────────────────────────────────
 */
const NOISE_THRESHOLD_MS = 1000;

export function useScreenExit(screenName: ScreenName): void {
  // 진입 시각을 ref로 보관. state로 두면 매 렌더 재계산 + 효과 의존성 폭발.
  // 초기값은 0(sentinel)이고 useEffect 마운트 시 Date.now()로 채움 — 렌더 단계에서
  // 불순 함수 호출을 피하기 위함(react-hooks/purity 룰).
  const enterTimeRef = useRef<number>(0);

  useEffect(() => {
    // 마운트 시점에 진입 시각 기록. StrictMode 더블 마운트에서도 ref만 갱신되어 안전.
    enterTimeRef.current = Date.now();

    function fire() {
      const now = Date.now();
      const duration = now - enterTimeRef.current;
      // 진입 직후 실수성 이탈은 제외. 0~1초 노이즈는 분석 가치도 낮음.
      if (duration < NOISE_THRESHOLD_MS) return;
      trackEvent('screen_exit', {
        screen_name: screenName,
        duration,
        // beacon 전송으로 unload 케이스에서도 유실 최소화.
        transport_type: 'beacon',
      });
      // 다음 구간 시작점으로 재사용 (visible 복귀 또는 hidden 후 추가 이탈).
      enterTimeRef.current = now;
    }

    function handleVisibility() {
      if (document.visibilityState === 'hidden') {
        fire();
      } else {
        // visible 복귀 — 새 구간 시작. (백그라운드 머문 시간은 측정에서 제외)
        enterTimeRef.current = Date.now();
      }
    }

    function handleBeforeUnload() {
      fire();
    }

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // 라우트 변경/언마운트 — 마지막 구간 정산.
      fire();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // screenName이 바뀌는 경우는 사실상 없지만, 의존성에 넣어 lint 경고 회피
    // 동시에 만에 하나 동적으로 바뀌면 새 측정으로 안전하게 재시작.
  }, [screenName]);
}
