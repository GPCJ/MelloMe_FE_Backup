import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await signup(email, password, agreeTerms, agreePrivacy);
      setTokens({ accessToken: data.accessToken });
      setUser({
        id: data.id,
        email: data.email,
        nickname: data.nickname,
        profileImageUrl: null,
        role: data.role,
      });
      navigate('/welcome', { replace: true, state: { redirectTo: '/welcome' } });
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { status?: number } }).response?.status === 409
      ) {
        setError('이미 사용 중인 이메일입니다.');
      } else {
        setError(
          err instanceof Error ? err.message : '회원가입에 실패했습니다.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">멜로미</h1>
        <p className="mt-2 text-sm text-gray-500">
          치료사들의 따뜻한 성장 공간
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="agreeTerms"
                  checked={agreeTerms}
                  onCheckedChange={(v) => setAgreeTerms(v === true)}
                />
                <Label
                  htmlFor="agreeTerms"
                  className="text-sm font-normal cursor-pointer"
                >
                  <a href="#" className="underline text-blue-600">
                    이용약관
                  </a>
                  에 동의합니다 (필수)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="agreePrivacy"
                  checked={agreePrivacy}
                  onCheckedChange={(v) => setAgreePrivacy(v === true)}
                />
                <Label
                  htmlFor="agreePrivacy"
                  className="text-sm font-normal cursor-pointer"
                >
                  <a href="#" className="underline text-blue-600">
                    개인정보처리방침
                  </a>
                  에 동의합니다 (필수)
                </Label>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !agreeTerms || !agreePrivacy}
            >
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <p className="mt-6 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
