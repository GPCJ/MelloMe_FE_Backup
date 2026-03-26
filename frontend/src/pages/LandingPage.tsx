import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const isVerified = user?.canAccessCommunity === true;
  const verificationStatus = user?.therapistVerification?.status ?? null;
  const isNotRequested =
    !!user &&
    (verificationStatus === 'NOT_REQUESTED' ||
      verificationStatus === 'REJECTED' ||
      verificationStatus === 'PENDING');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">멜로미</h1>
            {import.meta.env.VITE_MSW_ENABLED === 'true' ? (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
                MSW
              </span>
            ) : (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-600">
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isVerified ? (
              <Link
                to="/posts"
                className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg"
              >
                커뮤니티
              </Link>
            ) : isNotRequested ? (
              <Link
                to="/therapist-verifications"
                className="px-4 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-lg"
              >
                치료사 인증
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-md text-gray-600 hover:text-gray-900"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="text-md text-gray-600 hover:text-gray-900"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center pt-14">
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            치료사를 위한 커뮤니티
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            익명으로 케이스를 나누고, 동료들과 함께 성장하세요.
          </p>
          {isVerified ? (
            <Link
              to="/posts"
              className="inline-block px-6 py-2.5 text-white bg-gray-900 rounded-lg font-medium hover:bg-gray-800"
            >
              커뮤니티 바로가기 →
            </Link>
          ) : isNotRequested ? (
            <Link
              to="/therapist-verifications"
              className="inline-block px-6 py-2.5 text-white bg-gray-800 rounded-lg font-medium hover:bg-gray-700"
            >
              치료사 인증하기 →
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 text-white bg-gray-900 rounded-lg font-medium hover:bg-gray-800"
            >
              시작하기 →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-400">
          © 2026 멜로미
        </div>
      </footer>
    </div>
  );
}
