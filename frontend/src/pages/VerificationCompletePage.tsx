import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getMe, getMyVerification } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import type { TherapistVerificationDetail } from '../types/auth';

export default function VerificationCompletePage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [verification, setVerification] = useState<TherapistVerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMe(), getMyVerification()])
      .then(([freshUser, verDetail]) => {
        setUser(freshUser);
        setVerification(verDetail);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">로딩 ���...</p>
      </div>
    );
  }

  const verStatus = verification?.status;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {verStatus === 'APPROVED' ? (
        <>
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
        </>
      ) : verStatus === 'REJECTED' ? (
        <>
          <div className="text-5xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            인증이 반려되었습니다
          </h1>
          <p className="text-sm text-gray-500 mb-2">
            제출하신 서류가 승인되지 않았습니다.
          </p>
          {verification?.rejectReason && (
            <p className="text-sm text-red-500 mb-8 bg-red-50 rounded-lg px-4 py-3">
              사유: {verification.rejectReason}
            </p>
          )}
          <Button
            onClick={() => navigate('/therapist-verifications')}
            className="bg-violet-500 hover:bg-violet-600 text-white px-8"
          >
            다시 신청하기
          </Button>
        </>
      ) : (
        <>
          <div className="text-5xl mb-6">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            인증 신청�� 접수되었습니다
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            검토 후 승인되면 커뮤니티를 이용할 수 있어요.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-violet-500 hover:bg-violet-600 text-white px-8"
          >
            홈으로 돌아가기
          </Button>
        </>
      )}
    </div>
  );
}
