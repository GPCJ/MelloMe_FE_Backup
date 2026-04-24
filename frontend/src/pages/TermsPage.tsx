import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            멜로미
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">이용약관</h1>
        <p className="text-sm text-gray-500">
          이용약관은 현재 준비 중입니다. 공개 전까지 조금만 기다려 주세요.
        </p>
      </main>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-400">© 2026 멜로미</div>
      </footer>
    </div>
  );
}
