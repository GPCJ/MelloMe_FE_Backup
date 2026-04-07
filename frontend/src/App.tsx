import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import AuthRoute from './components/auth/AuthRoute';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import PostListPage from './pages/post/PostListPage';
import PostDetailPage from './pages/post/PostDetailPage';
import PostCreatePage from './pages/post/PostCreatePage';
import PostEditPage from './pages/post/PostEditPage';
import CommentWritePage from './pages/post/CommentWritePage';
import CommentDetailPage from './pages/post/CommentDetailPage';
import SearchPage from './pages/search/SearchPage';
import ProfilePage from './pages/profile/ProfilePage';
import TherapistVerificationPage from './pages/auth/TherapistVerificationPage';
import VerificationCompletePage from './pages/auth/VerificationCompletePage';

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
          </Route>

          {/* SignupPage는 GuestRoute 밖에 배치.
              GuestRoute 안에 있으면 setUser() 호출 시 GuestRoute가 먼저 리렌더되어
              환영 UI를 보여주기 전에 랜딩페이지로 튕기는 race condition 발생.
              로그인 유저 접근 차단은 SignupPage 내부에서 직접 처리. */}
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<AuthRoute />}>
            <Route path="/verification-complete" element={<VerificationCompletePage />} />
          </Route>

          {/* 로그인만 필요 (치료사 인증 불필요) */}
          <Route element={<AuthRoute />}>
            <Route path="/therapist-verifications" element={<TherapistVerificationPage />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/posts/:postId/comments" element={<CommentWritePage />} />
            <Route path="/posts/:postId/comments/:commentId" element={<CommentDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 로그인 + 치료사 인증 필요 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/posts/new" element={<PostCreatePage />} />
            <Route path="/posts/:postId/edit" element={<PostEditPage />} />
          </Route>

          <Route path="/my-page" element={<Navigate to="/profile" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
