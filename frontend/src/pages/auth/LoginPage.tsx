import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../../api/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/shadcn-ui/card';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, tokens } = await login(email, password);
      // PM 정식 스펙(2026-04-27)에서 `login_completed` 누락 — GA4 자동
      // `session_start`로 갈음 가능하다는 PM 판단으로 제거. 익명 환경 한계상
      // 로그인↔비로그인 구분은 못 하지만 KPI 5종에 미포함이라 영향 없음.
      // (PM 컨펌 완료 전이라면 한 번 더 확인 필요)
      setTokens(tokens);
      setUser(user);

      // TODO: 백엔드에서 탈퇴 유저 로그인 시 에러 응답 반환하도록 수정 예정
      // 배포 후 catch에서 DELETED_ACCOUNT 에러 코드 분기 추가할 것

      if (user.role !== 'USER') {
        navigate('/posts');
      } else {
        navigate('/therapist-verifications');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || '로그인에 실패했습니다.');
      } else {
        setError('로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* 상단 타이틀 */}
      <div className="w-full max-w-[640px] text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mellti</h1>
        <p className="mt-2 text-sm text-gray-500">치료사들의 따뜻한 성장의 바다 Mellti</p>
      </div>

      {/* 카드 */}
      <Card className="w-full max-w-[480px] rounded-[14px]">
        <CardHeader>
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription className="text-base">Mellti에 오신것을 환영합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* 이메일 */}
            <div className="space-y-1">
              <Label htmlFor="email">이메일 *</Label>
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
                  className="pl-9 bg-gray-100"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1">
              <Label htmlFor="password">비밀번호 *</Label>
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-9 pr-9 bg-gray-100"
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="keepSignedIn"
                  checked={keepSignedIn}
                  onCheckedChange={(v) => setKeepSignedIn(v === true)}
                />
                <Label htmlFor="keepSignedIn" className="text-sm font-normal cursor-pointer">
                  로그인 상태 유지
                </Label>
              </div>
              <button
                type="button"
                onClick={() => toast('준비 중인 기능입니다')}
                className="text-sm font-medium text-[#6d00da]"
              >
                비밀번호 찾기
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={loading || !email || !password}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* 회원가입 링크 */}
          <Link
            to="/signup"
            className="flex h-10 w-full items-center justify-center px-4 rounded-full border border-black bg-white text-sm text-[#0a0a0a] mt-4"
          >
            아직 계정이 없으신가요? <span className="ml-1 font-bold text-[#6d00da]">회원가입</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
