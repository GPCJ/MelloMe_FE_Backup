import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import type { MeResponse, Tokens } from '../types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newUserNickname, setNewUserNickname] = useState('');
  // isNewUser일 때 setAuth를 나중에 호출하기 위해 임시 보관
  // (setAuth를 먼저 호출하면 GuestRoute가 user를 감지해 환영 화면 전에 리다이렉트됨)
  const [pendingAuth, setPendingAuth] = useState<{
    user: MeResponse;
    tokens: Tokens;
  } | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, tokens, isNewUser } = await login(email, password);
      // 첫 로그인 유저라면 리렌더링 -> isNewUser Boolean 여부로 환영 화면 표시
      if (isNewUser) {
        setPendingAuth({ user, tokens });
        setNewUserNickname(user.nickname);
      } else {
        setAuth(user, tokens);
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/google/start`;
  }

  if (newUserNickname) {
    function handleAuth(path: string) {
      if (pendingAuth) setAuth(pendingAuth.user, pendingAuth.tokens);
      navigate(path);
    }

    return (
      <div className="fixed inset-0 z-50 bg-violet-100 flex flex-col items-center justify-center px-4">
        {/* 카드 */}
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
              onClick={() => handleAuth('/therapist-verifications')}
            >
              치료사 인증하러 가기
            </Button>
            <button
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors cursor-pointer"
              onClick={() => handleAuth('/')}
            >
              나중에 하기
            </button>
          </div>
        </div>

        {/* 하단 텍스트 */}
        <p className="mt-6 text-xs text-violet-400">
          인증 없이도 멜로미의 일부 기능을 이용할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* 상단 타이틀 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">멜로미</h1>
        <p className="mt-2 text-sm text-gray-500">
          치료사들의 따뜻한 성장 공간
        </p>
      </div>

      {/* 카드 */}
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">로그인</CardTitle>
          <CardDescription>
            멜로미 커뮤니티에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* 이메일 */}
            <div className="space-y-1">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 로그인 상태 유지 + 비밀번호 찾기 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                />
                로그인 상태 유지
              </label>
              <button
                type="button"
                className="text-sm text-blue-500 hover:underline"
              >
                비밀번호 찾기
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn size={16} />
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* 회원가입 링크 */}
          <p className="text-center text-sm text-gray-500">
            아직 계정이 없으신가요?{' '}
            <Link
              to="/signup"
              className="text-blue-500 font-semibold hover:underline"
            >
              회원가입
            </Link>
          </p>

          {/* 구글 로그인 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-2 px-4 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google로 계속하기
          </button>
        </CardContent>
      </Card>

      {/* 하단 이용약관 */}
      <p className="mt-6 text-xs text-gray-400 text-center">
        로그인 시{' '}
        <button type="button" className="text-blue-400 hover:underline">
          이용약관
        </button>{' '}
        및{' '}
        <button type="button" className="text-blue-400 hover:underline">
          개인정보처리방침
        </button>
        에 동의하게 됩니다.
      </p>
    </div>
  );
}
