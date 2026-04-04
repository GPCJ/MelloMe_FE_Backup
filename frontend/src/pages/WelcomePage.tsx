import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../stores/useAuthStore';

export default function WelcomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        환영합니다, {user?.nickname ?? ''}님!
      </h1>
      <p className="text-sm text-gray-500 mb-2">
        멜로미 회원가입이 완료되었어요.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        커뮤니티를 이용하려면 <strong>치료사 인증</strong>이 필요합니다.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={() => navigate('/therapist-verifications')}
          className="w-full bg-violet-500 hover:bg-violet-600 text-white"
        >
          치료사 인증하기
        </Button>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
