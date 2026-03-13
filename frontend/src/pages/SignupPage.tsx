import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, login } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, nickname);
      const { user, tokens } = await login(email, password);
      setAuth(user, tokens);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">치료사 커뮤니티</h1>
          <p className="mt-2 text-sm text-gray-500">
            치료사 전용 커뮤니티에 오신 것을 환영합니다
          </p>
        </div>

        {/* 카드 */}
        <Card>
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
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '가입 중...' : '회원가입'}
              </Button>
            </form>

            {/* 로그인 링크 */}
            <p className="mt-6 text-center text-sm text-gray-500">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                로그인
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
