import { Link } from 'react-router-dom';
import TermsContent from '../components/legal/TermsContent';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            Mellti
          </Link>
          <span className="text-xs text-gray-400">시행일 2026-05-04</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">이용약관</h1>
        <TermsContent />
      </main>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-400">© 2026 Mellti</div>
      </footer>
    </div>
  );
}
