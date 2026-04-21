import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobilePageHeaderProps {
  title: string;
  backTo?: string;
  rightAction?: ReactNode;
}

export default function MobilePageHeader({ title, backTo, rightAction }: MobilePageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-base font-bold text-gray-900">{title}</h1>
      </div>
      {rightAction}
    </div>
  );
}
