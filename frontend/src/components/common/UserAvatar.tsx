import { useState } from 'react';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

interface UserAvatarProps {
  nickname: string;
  imageUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeMap = {
  xs: { container: 'w-5 h-5', text: 'text-[8px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-9 h-9', text: 'text-sm' },
  lg: { container: 'w-16 h-16', text: 'text-2xl' },
} as const;

export default function UserAvatar({ nickname, imageUrl, size = 'sm' }: UserAvatarProps) {
  const resolved = resolveImageUrl(imageUrl);
  const { container, text } = sizeMap[size];
  // 이미지 로드 실패(예: BE가 presigned 대신 raw S3 키를 내려준 경우) 시 이니셜로 폴백.
  // 실패한 src 자체를 기억해, src가 바뀌면(다른 유저) 자연히 다시 시도한다.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (resolved && resolved !== failedSrc) {
    return (
      <img
        src={resolved}
        alt={nickname}
        onError={() => setFailedSrc(resolved)}
        className={`${container} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-purple-300 flex items-center justify-center text-white ${text} font-bold shrink-0`}
    >
      {nickname[0] ?? '?'}
    </div>
  );
}
