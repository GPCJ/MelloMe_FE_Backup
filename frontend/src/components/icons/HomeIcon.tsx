import type { SVGProps } from 'react';

// 멜로미 디자인 시안 아이콘 (피그마 IconNavHome).
// 색은 stroke="currentColor"로 위임 — 부모 요소의 text-* 색을 그대로 따라감.
//   예) <div className="text-gray-900"><HomeIcon /></div> → 검정
//       <div className="text-gray-400"><HomeIcon /></div> → 회색
// size prop은 width/height만 바꿔서 스케일. viewBox는 24x24 고정이라 비례 유지.
type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function HomeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 17.5C3 19.1569 5.01472 20.5 7.5 20.5C9.98528 20.5 12 19.1569 12 17.5C12 19.1569 14.0147 20.5 16.5 20.5C18.9853 20.5 21 19.1569 21 17.5M3 10.5C3 12.1569 5.01472 13.5 7.5 13.5C9.98528 13.5 12 12.1569 12 10.5C12 12.1569 14.0147 13.5 16.5 13.5C18.9853 13.5 21 12.1569 21 10.5M3 3.5C3 5.15685 5.01472 6.5 7.5 6.5C9.98528 6.5 12 5.15685 12 3.5C12 5.15685 14.0147 6.5 16.5 6.5C18.9853 6.5 21 5.15685 21 3.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
