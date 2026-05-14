import type { SVGProps } from 'react';

// Mellti 디자인 시안 아이콘 (피그마 icon_h_Edit).
// 색·크기 제어 방식은 HomeIcon 주석 참고.
type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function ProfileEditIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5173 1.51204C14.2007 0.828661 15.3085 0.828677 15.9919 1.51204L21.6814 7.20149C22.3647 7.88491 22.3647 8.99272 21.6814 9.6761L12.6091 18.7484C11.9257 19.4315 10.8179 19.4316 10.1345 18.7484L4.44505 13.0589C3.76175 12.3756 3.76186 11.2677 4.44505 10.5843L13.5173 1.51204ZM5.5056 11.6449C5.40819 11.7425 5.40808 11.9008 5.5056 11.9984L11.1951 17.6878C11.2926 17.7853 11.451 17.7852 11.5486 17.6878L13.8269 15.4085L7.78392 9.36556L5.5056 11.6449ZM14.9314 2.57259C14.8338 2.47501 14.6755 2.47499 14.5779 2.57259L8.84447 8.30501L14.8874 14.348L20.6208 8.61556C20.7184 8.51796 20.7184 8.35967 20.6208 8.26204L14.9314 2.57259Z"
        fill="currentColor"
      />
      <path
        d="M3 18C3 19.6569 5.01472 21 7.5 21C8.02595 21 8.53083 20.9398 9 20.8293"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M21 18C21 19.6569 18.9853 21 16.5 21C15.974 21 15.4692 20.9398 15 20.8293"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
