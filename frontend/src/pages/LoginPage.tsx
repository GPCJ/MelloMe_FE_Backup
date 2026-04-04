import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
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
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, tokens } = await login(email, password);
      setAuth(user, tokens);
      const verStatus = user.therapistVerification?.status;
      if (user.canAccessCommunity) {
        navigate('/posts');
      } else if (verStatus === 'NOT_REQUESTED' || verStatus === 'REJECTED') {
        navigate('/therapist-verifications');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
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
