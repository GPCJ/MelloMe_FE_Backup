import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signup } from '../../api/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { trackEvent } from '../../lib/analytics';
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
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function SignupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 회원가입 성공 후 환영 UI를 같은 페이지에서 보여주기 위한 상태.
  // 별도 페이지(/welcome)로 이동하지 않는 이유:
  // SignupPage가 GuestRoute 안에 있으면 setUser() 호출 시
  // GuestRoute가 먼저 리렌더되어 랜딩페이지로 튕기는 race condition 발생.
  // 페이지 이동 없이 컴포넌트 내부 상태만 전환하면 이 문제를 근본적으로 회피.
  const [signupComplete, setSignupComplete] = useState(false);

  // GuestRoute 밖에 있으므로 직접 로그인 유저 접근을 차단.
  // 단, 방금 회원가입을 완료한 경우(signupComplete)는 환영 UI를 보여줘야 하므로 제외.
  if (user && !signupComplete) return <Navigate to="/" replace />;

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
      // PM 정식 스펙(2026-04-27): `signup_completed` → `sign_up`으로 리네임.
      // 가입 mutation 성공 직후, navigate/setUser 전에 발송해 유저 액션과 동기화.
      trackEvent('sign_up');
      setTokens({ accessToken: data.accessToken });
      setUser({
        id: data.id,
        email: data.email,
        nickname: data.nickname,
        profileImageUrl: null,
        role: data.role,
      });
      setSignupComplete(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('이미 사용 중인 이메일입니다.');
      } else if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || '회원가입에 실패했습니다.');
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }

  // 회원가입 성공 → 환영 UI
  if (signupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          환영합니다{user?.nickname ? `, ${user.nickname}` : ''}님!
        </h1>
        <p className="text-sm text-gray-500 mb-2">멜로미 회원가입이 완료되었어요.</p>
        <p className="text-sm text-gray-500 mb-8">
          <strong>치료사 인증</strong>을 완료하면 모든 게시물을 열람하고 글을 작성할 수 있어요.
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

  return (
    /*
    배경색: MVP 와이어프레임은 일단 그라데이션 없이 색 빠진 버전이 맞는 것 같음 그리고 디자이너의 확정 디자인도 그라데이션 없음.
    */
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">mellty</h1>
        <p className="mt-2 text-sm text-gray-500">치료사들의 따뜻한 성장 공간</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-base">회원가입</CardTitle>
          <CardDescription className="text-center text-base">
            멜로미와 함께 성장해요 💜
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                {/* 왜 placeholder하고 아이콘이 겹치지? -> input에 왼쪽 padding을 안줘서*/}
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
                  placeholder="8자 이상 입력해주세요"
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
            <div className="space-y-1">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="passwordConfirm"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
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
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="agreeTerms"
                  checked={agreeTerms}
                  onCheckedChange={(v) => setAgreeTerms(v === true)}
                />
                <Label htmlFor="agreeTerms" className="text-sm font-normal cursor-pointer">
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
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
                <Label htmlFor="agreePrivacy" className="text-sm font-normal cursor-pointer">
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    개인정보처리방침
                  </a>
                  에 동의합니다 (필수)
                </Label>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading || !agreeTerms || !agreePrivacy}
            >
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
      <p className="mt-6 text-sm text-gray-500">멜로미는 치료사 전용 커뮤니티입니다</p>
    </div>
  );
}
