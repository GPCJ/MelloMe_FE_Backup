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

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={nickname}
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
