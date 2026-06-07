// 홈피드 본문 미리보기 어댑터.
// 백엔드는 글자수 초과 시 contentPreview 끝에 "..."(또는 "…") 생략 표식을 붙여 내려준다.
// 프론트도 5줄 클램프로 자르므로, "더 있음" 신호가 백/프론트에서 중복·불일치한다.
// → 프론트가 신호를 단일 소유하도록, 표식을 떼어내고 "잘림 여부"만 boolean으로 승격한다.
//
// 한계(의도적): 작성자가 본문을 "..."로 끝낸 짧은 글은 잘림으로 오탐될 수 있으나,
// 클릭 시 동일 상세로 이동하므로 무해. 정식 해결은 백엔드 truncated 플래그(backlog F-08 [BE]).
const TRAILING_ELLIPSIS = /\s*(?:\.\.\.|…)\s*$/;

export interface ParsedPreview {
  /** 백엔드 생략 표식을 제거한 본문 미리보기 */
  text: string;
  /** 백엔드가 글자수 초과로 생략했는지(표식 존재 여부) */
  backendTruncated: boolean;
}

export function parseContentPreview(preview?: string): ParsedPreview {
  const raw = preview ?? '';
  const backendTruncated = TRAILING_ELLIPSIS.test(raw);
  const text = backendTruncated ? raw.replace(TRAILING_ELLIPSIS, '') : raw;
  return { text, backendTruncated };
}
