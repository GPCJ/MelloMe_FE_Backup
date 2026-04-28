/**
 * ─────────────────────────────────────────────────────────────────────
 *  GA4 커스텀 이벤트 헬퍼
 * ─────────────────────────────────────────────────────────────────────
 *  PM 정식 스펙(2026-04-27) 주요 7개 이벤트 발송 + 다중 분기를 가진
 *  `reaction` 이벤트의 단일 진입점을 제공합니다.
 *
 *  왜 이 파일이 필요한가:
 *  - `window.gtag?.('event', ...)`를 호출 사이트마다 직접 쓰면 두 가지가 깨집니다.
 *    1) 가드 패턴 동기화 — 애드블로커/로드 실패 시 undefined인 점을 매번 챙겨야 함
 *    2) 이벤트 이름/파라미터 오타 — 문자열 리터럴이라 IDE가 못 잡음
 *  - 헬퍼 한 곳에서 옵셔널 체인 + 타입드 enum으로 두 문제 모두 해결합니다.
 *
 *  타입 충돌 주의:
 *  - `types/post`의 `ReactionType`은 백엔드 도메인 enum (LIKE/CURIOUS/USEFUL).
 *  - 여기 정의하는 `ReactionEventType`은 GA4 이벤트 파라미터 enum
 *    (react_like/react_curious/react_useful + comment/scrap/download).
 *    의미가 다르므로 이름을 분리해 import 시 혼선을 막습니다.
 *
 *  주의:
 *  - `window.gtag` 타입 선언은 `hooks/useGA4PageView.ts`의 `declare global`이
 *    프로젝트 전역에 이미 올려두었으므로 여기서 재선언하지 않습니다.
 *    (TS의 declaration merging — 같은 globalThis 인터페이스에 중복 선언하면 충돌)
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * GA4 커스텀 이벤트 발송 래퍼.
 *
 * @param name   PM 정식 스펙의 이벤트명 (예: 'sign_up', 'post_created')
 * @param params 이벤트 파라미터 (옵션). GA4는 키당 텍스트 100자/숫자 제한이 있으니 길이 주의.
 *
 * 가드:
 * - `typeof window.gtag !== 'function'` 체크로 SSR/애드블로커/Clarity 차단/네트워크 오류
 *   상황에서 런타임 에러를 막습니다 (useGA4PageView와 동일 패턴).
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  // 개발 환경에서만 콘솔 로그 — 빠른 동작 검증용. production 빌드에서는 트리쉐이킹으로 제거됨.
  if (import.meta.env.DEV) console.log('[GA4]', name, params);
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

/**
 * `reaction` 이벤트의 type 파라미터로 허용되는 6분기.
 *
 * PM 스펙 주석:
 * - react_like / react_curious / react_useful : 본문 3종 리액션
 * - comment   : 댓글 작성 성공
 * - scrap     : 게시글 스크랩 토글 (on 만? off 도? — 현재 on/off 구분 없이 둘 다 발송)
 * - download  : 첨부파일/이미지 다운로드 클릭
 *
 * 백엔드 도메인 enum(`types/post`의 ReactionType: LIKE/CURIOUS/USEFUL)과 다른 layer입니다.
 * useReactionToggle에서 `LIKE` → `react_like` 매핑은 호출 사이트에서 처리합니다.
 */
export type ReactionEventType =
  | 'react_like'
  | 'react_curious'
  | 'react_useful'
  | 'comment'
  | 'scrap'
  | 'download';

/**
 * `reaction` 단일 이벤트 헬퍼.
 *
 * 왜 단일 이벤트인가:
 * - PM이 6분기를 `type` 파라미터 하나로 통합 설계했습니다 (이벤트 카운트 인플레 방지).
 * - GA4 이벤트 종류를 늘리는 것보다 파라미터로 분기하는 편이 무료 티어 한도(2M/월) 친화적.
 *
 * @param type   리액션 분기 (위 6종 중 하나)
 * @param params 부가 파라미터. 보통 `postId`만 넘기지만 추후 `commentId` 등 확장 가능.
 */
export function trackReaction(
  type: ReactionEventType,
  params?: { postId?: number; [k: string]: unknown },
): void {
  trackEvent('reaction', { type, ...(params ?? {}) });
}

/**
 * `screen_exit` 이벤트의 screen_name 파라미터로 허용되는 3종.
 *
 * useScreenExit 훅에서 사용. 이름을 여기에 모아두는 이유는 헬퍼/훅이 같은
 * 어휘를 쓰도록 한 곳에서 정의하기 위함입니다 (오타 방지).
 */
export type ScreenName = 'feed' | 'post_write' | 'my_page';
