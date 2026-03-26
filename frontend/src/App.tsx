import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AuthRoute from './components/AuthRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostCreatePage from './pages/PostCreatePage';
import PostEditPage from './pages/PostEditPage';
import MyPage from './pages/MyPage';
import TherapistVerificationPage from './pages/TherapistVerificationPage';
import WelcomePage from './pages/WelcomePage';
import VerificationCompletePage from './pages/VerificationCompletePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LandingPage — 자체 navbar/footer가 있어서 Layout 밖에 위치 */}
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>

          {/* 비로그인 전용 라우트 */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* 회원가입 후 전환 페이지 (가드 불필요) */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/verification-complete" element={<VerificationCompletePage />} />

          {/* 로그인만 필요 (인증 불필요) */}
          <Route element={<AuthRoute />}>
            <Route path="/therapist-verifications" element={<TherapistVerificationPage />} />
          </Route>

          {/* 로그인 + 치료사 인증 필요 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/new" element={<PostCreatePage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/posts/:postId/edit" element={<PostEditPage />} />
            <Route path="/my-page" element={<MyPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
