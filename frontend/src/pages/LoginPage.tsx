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
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

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
      setTokens(tokens);
      setUser(user);

      // [임시 대응 — 부분적 커버] 탈퇴(소프트 삭제) 계정 감지
      // 현재 백엔드는 탈퇴 유저에게 만료된 AT를 발급하여 서비스를 차단함.
      // JWT payload의 exp를 디코딩하여 발급 시점에 이미 만료된 토큰인지 확인한다.
      //
      // 한계:
      // - 로그인 시점에서만 감지 가능. 이미 진입한 상태(페이지 새로고침 등)에서는
      //   인터셉터 refresh가 RT로 새 AT를 발급받아 우회되며, 모든 페이지가
      //   스켈레톤 UI만 표시되는 "서비스 장애" UX가 됨.
      // - 프론트만으로는 완전한 해결 불가 — 백엔드 수정이 필요함.
      //
      // TODO: 백엔드에서 탈퇴 유저 로그인 시 명확한 에러 응답(예: 403 DELETED_ACCOUNT)을
      //       반환하도록 변경되면 이 로직을 제거하고 catch에서 직접 분기할 것.
      //       관련 이슈: AIRO-offical/therapist_community_BE#32
      try {
        const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          clearAuth();
          setError('탈퇴된 계정입니다. 새로운 계정으로 가입해주세요.');
          return;
        }
      } catch {
        // JWT 디코딩 실패 — 비정상 토큰이므로 차단
        clearAuth();
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      if (user.role !== 'USER') {
        navigate('/posts');
      } else {
        navigate('/therapist-verifications');
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
