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
import { LegalModal } from '@/components/legal/LegalModal';
import TermsContent from '@/components/legal/TermsContent';
import PrivacyContent from '@/components/legal/PrivacyContent';

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
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

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
      localStorage.setItem('mello:welcome-pending', '1');
      navigate('/posts');
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

  return (
    /*
    배경색: MVP 와이어프레임은 일단 그라데이션 없이 색 빠진 버전이 맞는 것 같음 그리고 디자이너의 확정 디자인도 그라데이션 없음.
    */
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[640px] text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">mellty</h1>
        <p className="mt-2 text-sm text-gray-500">치료사들의 따뜻한 성장 공간 멜티</p>
      </div>

      <Card className="w-full max-w-[640px] rounded-[14px]">
        <CardHeader>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription className="text-base">멜티와 함께 성장해요 :D</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">이메일 *</Label>
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
              <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
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
                  placeholder="비밀번호를 다시 입력해주세요"
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegalModal('terms');
                    }}
                    className="underline text-[#ff7f4c] font-bold"
                  >
                    이용약관
                  </button>
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegalModal('privacy');
                    }}
                    className="underline text-[#ff7f4c] font-bold"
                  >
                    개인정보처리방침
                  </button>
                  에 동의합니다 (필수)
                </Label>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={loading || !agreeTerms || !agreePrivacy}
            >
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <Link
            to="/login"
            className="flex h-10 w-full items-center justify-center px-4 rounded-full border border-black bg-white text-sm text-[#0a0a0a] mt-4"
          >
            아직 계정이 없으신가요? <span className="ml-1 font-bold text-[#6d00da]">로그인</span>
          </Link>
        </CardContent>
      </Card>
      <LegalModal
        open={legalModal === 'terms'}
        onClose={() => setLegalModal(null)}
        title="이용약관"
      >
        <TermsContent />
      </LegalModal>
      <LegalModal
        open={legalModal === 'privacy'}
        onClose={() => setLegalModal(null)}
        title="개인정보처리방침"
      >
        <PrivacyContent />
      </LegalModal>
    </div>
  );
}
