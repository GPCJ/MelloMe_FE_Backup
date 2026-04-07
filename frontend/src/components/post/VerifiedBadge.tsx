interface VerifiedBadgeProps {
  status?: 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function VerifiedBadge({ status }: VerifiedBadgeProps) {
  if (status !== 'APPROVED') return null;

  return (
    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-900 text-[10px] font-medium leading-tight">
      인증
    </span>
  );
}
