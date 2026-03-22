import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostCreatePage from './pages/PostCreatePage';
import PostEditPage from './pages/PostEditPage';
import MyPage from './pages/MyPage';
import TherapistVerificationPage from './pages/TherapistVerificationPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/posts" replace />} />

            {/* 비로그인 전용 라우트 */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* 로그인 필요 라우트 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/posts" element={<PostListPage />} />
              <Route path="/posts/new" element={<PostCreatePage />} />
              <Route path="/posts/:postId" element={<PostDetailPage />} />
              <Route path="/posts/:postId/edit" element={<PostEditPage />} />
              <Route path="/my-page" element={<MyPage />} />
              <Route path="/therapist-verifications" element={<TherapistVerificationPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
