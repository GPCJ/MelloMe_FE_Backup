import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeOAuthCode } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import type { MeResponse, Tokens } from '../types/auth';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [newUserNickname, setNewUserNickname] = useState('');
  const [pendingAuth, setPendingAuth] = useState<{ user: MeResponse; tokens: Tokens } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    exchangeOAuthCode(code, redirectUri)
      .then(({ user, tokens, isNewUser }) => {
        if (isNewUser) {
          setPendingAuth({ user, tokens });
          setNewUserNickname(user.nickname);
        } else {
          setAuth(user, tokens);
          navigate('/', { replace: true });
        }
      })
      .catch(() => {
        setError('로그인에 실패했습니다.');
      });
  }, [navigate, setAuth]);

  function handleWelcome(path: string) {
    if (pendingAuth) setAuth(pendingAuth.user, pendingAuth.tokens);
    navigate(path, { replace: true });
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/login')}>로그인으로 돌아가기</Button>
      </div>
    );
  }

  if (newUserNickname) {
    return (
      <div className="fixed inset-0 z-50 bg-violet-100 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">🎊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">환영합니다!</h2>
          <p className="text-sm text-gray-500 mb-8">
            멜로미에 오신 것을 환영해요. <br />
            치료사 인증을 받은 분만 커뮤니티를 이용할 수 있어요.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-violet-500 hover:bg-violet-600 text-white py-6 text-base font-bold shadow-md shadow-violet-200 cursor-pointer"
              onClick={() => handleWelcome('/therapist-verifications')}
            >
              치료사 인증하러 가기
            </Button>
            <button
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors cursor-pointer"
              onClick={() => handleWelcome('/')}
            >
              나중에 하기
            </button>
          </div>
        </div>
        <p className="mt-6 text-xs text-violet-400">
          인증 없이도 멜로미의 일부 기능을 이용할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">로그인 처리 중...</p>
    </div>
  );
}
