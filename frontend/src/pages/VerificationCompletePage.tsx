import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getMe } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';

export default function VerificationCompletePage() {
  const navigate = useNavigate();
  const { tokens, setAuth } = useAuthStore();

  useEffect(() => {
    getMe().then((freshUser) => {
      if (tokens) setAuth(freshUser, tokens);
    });
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-6">✅</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        치료사 인증이 완료되었습니다!
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        이제 멜로미 커뮤니티에서 자유롭게 활동할 수 있어요.
      </p>
      <Button
        onClick={() => navigate('/posts')}
        className="bg-violet-500 hover:bg-violet-600 text-white px-8"
      >
        커뮤니티 시작하기
      </Button>
    </div>
  );
}
