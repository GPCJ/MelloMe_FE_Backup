// 서버가 내려주는 "이미지 URL"을 <img src>에 바로 꽂을 수 있는 형태로 정규화.
// 백엔드가 절대 URL, 상대경로(/api/...), 프로토콜 상대(//cdn...) 등 어떤 포맷으로 줘도
// 브라우저 표준 규칙(new URL)대로 해석해서 항상 올바른 최종 URL을 만들어낸다.

// ── 모듈 로드 시 1회 계산 ────────────────────────────────────────────
// VITE_API_BASE_URL 예: "https://api.melonnetherapists.com/api/v1"
// 환경변수가 비어 있을 수도 있어 ?? '' 로 기본값.
const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

// backendOrigin = 프로토콜 + 호스트 (+ 포트) 까지만.
// 예: "https://api.melonnetherapists.com/api/v1" → "https://api.melonnetherapists.com"
//
// IIFE(즉시 실행 함수)로 감싼 이유:
//   - new URL()은 유효하지 않은 문자열을 받으면 예외를 던진다.
//   - const 선언에 try/catch를 직접 쓸 수 없어서, 함수로 감싸 반환값을 const에 넣는다.
//   - 매 호출마다 다시 계산할 필요가 없으니 모듈 로드 때 1회만 계산.
//
// 실패 시 '' 로 폴백 → 아래 resolveImageUrl에서 이 경우를 별도 분기 처리.
// (dev 환경에서 apiBase를 상대경로로 둔다거나, 환경변수 설정을 깜빡한 경우 대응)
const backendOrigin = (() => {
  try {
    return new URL(apiBase).origin
  } catch {
    return ''
  }
})()

/**
 * 서버가 준 이미지 URL 문자열을 브라우저가 해석 가능한 최종 URL로 변환.
 * 만들 수 없으면 null 반환 — null일 때 어떤 UI를 보여줄지는 호출부 책임.
 *
 * 입력 예시 → 출력:
 *   "https://api.../img.jpg"         → 그대로 (절대 URL이면 base 무시)
 *   "/api/v1/posts/19/images/7"      → "https://api.melonnetherapists.com/api/v1/posts/19/images/7"
 *   "//cdn.example.com/x.png"        → "https://cdn.example.com/x.png" (프로토콜만 base에서 가져옴)
 *   null / undefined / ""            → null (호출부에서 ?? '' 로 처리)
 *
 * 핵심: new URL(url, base)
 *   - url이 절대 URL이면 base를 무시하고 url 그대로.
 *   - url이 "/"로 시작하면 base의 origin에 이어붙임.
 *   - url이 "//"로 시작하면 base의 프로토콜만 빌려옴.
 *   - url이 상대 경로면 base의 경로를 기준으로 합침.
 *   이 규칙이 브라우저에 내장되어 있어, 우리가 직접 구현할 필요 없음.
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  // 1) 입력이 비어있으면 합칠 대상이 없음 → 호출부에서 대체 UI(예: 이니셜 아바타) 띄우도록 null.
  if (!url) return null

  // 2) backendOrigin을 못 구한 경우(환경변수 이상):
  //    억지로 합치지 말고 원본을 그대로 반환.
  //    dev 모드에서 Vite 프록시가 상대경로를 처리해주는 시나리오를 깨지 않기 위함.
  if (!backendOrigin) return url

  // 3) 브라우저 표준 규칙으로 최종 URL 조립. 실패 시 null로 안전 폴백.
  //    new URL()은 입력이 완전히 이상할 때만 throw — 정상 범위 입력은 거의 다 처리됨.
  try {
    return new URL(url, backendOrigin).toString()
  } catch {
    return null
  }
}
