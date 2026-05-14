import type { SVGProps } from 'react';

// Mellti 디자인 시안 아이콘 (피그마 IconNavSuch).
// 색·크기 제어 방식은 HomeIcon 주석 참고.
type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function SearchIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
