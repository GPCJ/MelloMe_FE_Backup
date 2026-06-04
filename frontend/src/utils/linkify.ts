// 게시글 본문의 평문 URL을 클릭 가능한 링크로 변환하는 어댑터.
// 작성 에디터(SimpleTextEditor)는 평문 textarea라 본문에 <a>가 없고 URL도 그냥 글자다.
// → 렌더 시점에 http(s) URL을 찾아 <a>로 감싼 HTML 문자열을 만든다.
//   (저장 데이터는 평문 그대로 두어 기존 글까지 모두 적용되고 되돌리기 쉽다.)
//
// 평문을 HTML로 바꾸는 것이므로 URL이 아닌 조각은 반드시 escape해야 안전하다.
// 위험 스킴(javascript: 등) 차단은 호출부의 DOMPurify.sanitize가 담당한다.
//
// 한계(의도적): 단순 정규식이라 URL 끝의 문장부호(`.`, `)`, `,` 등)까지 링크에
// 포함될 수 있다. 일반 URL 공유엔 충분하며, 정교한 탐지가 필요하면 linkify 계열
// 라이브러리 도입을 검토한다(트레이드오프: 새 의존성).

const URL_RE = /https?:\/\/[^\s<]+/g;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 평문 본문에서 http(s) URL을 <a> 태그로 감싼 HTML 문자열을 반환한다.
 * URL이 아닌 텍스트는 HTML escape하므로, 호출부에서 DOMPurify로 정화 후
 * dangerouslySetInnerHTML에 그대로 주입할 수 있다.
 */
export function linkifyUrls(text: string): string {
  let result = '';
  let lastIndex = 0;
  for (const match of text.matchAll(URL_RE)) {
    const url = match[0];
    const start = match.index ?? 0;
    result += escapeHtml(text.slice(lastIndex, start));
    const safeUrl = escapeHtml(url);
    result += `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
    lastIndex = start + url.length;
  }
  result += escapeHtml(text.slice(lastIndex));
  return result;
}
