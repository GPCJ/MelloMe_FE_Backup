import type { SVGProps } from 'react';

// 멜로미 디자인 시안 아이콘 (피그마 IconNavPost — 글쓰기).
// path 3개: 펜촉 본체 + 잉크 자국 2개. 모두 stroke="currentColor"라 한 색으로 합쳐짐.
type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function WriteIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 18C12 19.6569 9.98528 21 7.5 21C5.01472 21 3 19.6569 3 18"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M21 18C21 19.6569 18.9853 21 16.5 21C14.0147 21 12 19.6569 12 18"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M16.3788 1.62424C16.7766 1.22642 17.3161 1.00293 17.8787 1.00293C18.4413 1.00293 18.9809 1.22642 19.3787 1.62424C19.7765 2.02205 20 2.56161 20 3.1242C20 3.6868 19.7765 4.22635 19.3787 4.62417L10.3659 13.638C10.1285 13.8752 9.83512 14.0489 9.51292 14.1429L6.63998 14.9829C6.55394 15.008 6.46273 15.0095 6.3759 14.9873C6.28907 14.965 6.20982 14.9199 6.14644 14.8565C6.08306 14.7931 6.03789 14.7139 6.01564 14.627C5.9934 14.5402 5.9949 14.449 6.02 14.3629L6.85998 11.49C6.9545 11.1681 7.12851 10.8751 7.36597 10.638L16.3788 1.62424Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
