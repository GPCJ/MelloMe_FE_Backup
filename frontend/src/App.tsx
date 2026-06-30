import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import Layout from './components/layout/Layout';
import LandingPage from './pages/landing/LandingPage';
import GuestRoute from './components/auth/GuestRoute';
import AuthRoute from './components/auth/AuthRoute';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import PostListPage from './pages/post/PostListPage';
import PostDetailPage from './pages/post/PostDetailPage';
import PostCreatePage from './pages/post/PostCreatePage';
import JobPostDetailPage from './pages/jobpost/JobPostDetailPage';
import PostEditPage from './pages/post/PostEditPage';
import CommentWritePage from './pages/post/CommentWritePage';
import CommentDetailPage from './pages/post/CommentDetailPage';
import MessageComposePage from './pages/message/MessageComposePage';
import MessageBoxPage from './pages/message/MessageBoxPage';
import MessageDetailPage from './pages/message/MessageDetailPage';
import SearchPage from './pages/search/SearchPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationPage from './pages/notification/NotificationPage';
import TherapistVerificationPage from './pages/auth/TherapistVerificationPage';
import VerificationCompletePage from './pages/auth/VerificationCompletePage';
import { useGA4PageView } from './hooks/useGA4PageView';
import { useNotificationSSE } from './hooks/useNotificationSSE';

/**
 * SPA 라우트 변경 시마다 GA4에 page_view 이벤트를 발송하는 트래커.
 *
 * 이 컴포넌트는 UI를 렌더하지 않고 사이드이펙트(이벤트 발송)만 수행.
 * BrowserRouter 내부에 두는 이유: useLocation은 Router context 필요 →
 * App 루트에서 직접 useGA4PageView()를 호출하면 context 없어서 런타임 에러.
 */
function AnalyticsTracker() {
  useGA4PageView();
  return null;
}

/** 로그인 상태일 때 SSE 알림 연결을 관리. UI 없이 사이드이펙트만 수행. */
function NotificationManager() {
  useNotificationSSE();
  return null;
}

/** Android 하드웨어 뒤로가기를 WebView history 탐색으로 연결. 히스토리 없으면 앱 종료. */
function AndroidBackButtonManager() {
  useEffect(() => {
    const listenerPromise = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
    return () => { listenerPromise.then(h => h.remove()); };
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <NotificationManager />
      <AndroidBackButtonManager />
      <Routes>
        {/* `/`는 로그인 여부와 무관하게 누구에게나 랜딩 페이지를 노출(2026-06-06 부활).
        로그인 유저는 랜딩 nav의 "커뮤니티" 링크로 /posts 이동. */}
        <Route path="/" element={<LandingPage />} />
        {/* 정책 페이지 — 비로그인/로그인 모두 접근, Layout 밖 독립 렌더 */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* SignupPage는 standalone(Layout 밖, GuestRoute 밖).
        - Layout 밖: 디자이너 시안이 네비바 없는 standalone 폼으로 확정 (2026-05-06)
        - GuestRoute 밖: setUser() 호출 시 GuestRoute가 먼저 리렌더되어 환영 UI 전에
        튕기는 race condition 회피. 로그인 유저 차단은 SignupPage 내부에서. */}
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<Layout />}>
          {/* 비로그인 전용 라우트 */}

          <Route element={<AuthRoute />}>
            <Route path="/verification-complete" element={<VerificationCompletePage />} />
          </Route>

          {/* 로그인만 필요 (USER도 작성 가능, 단 PostCreatePage에서 공개글로 제한) */}
          <Route element={<AuthRoute />}>
            <Route path="/therapist-verifications" element={<TherapistVerificationPage />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/posts/:postId/comments" element={<CommentWritePage />} />
            <Route path="/posts/:postId/comments/:commentId" element={<CommentDetailPage />} />
            <Route path="/posts/new" element={<PostCreatePage />} />
            <Route path="/job-posts/:jobPostId" element={<JobPostDetailPage />} />
            <Route path="/posts/:postId/edit" element={<PostEditPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* 쪽지함(받은/보낸 2탭). 상세는 /messages/:messageId */}
            <Route path="/messages" element={<MessageBoxPage />} />
            {/* 모바일 쪽지 작성. 정적 경로라 /messages/:messageId보다 먼저 배치 */}
            <Route path="/messages/new" element={<MessageComposePage />} />
            <Route path="/messages/:messageId" element={<MessageDetailPage />} />
          </Route>

          <Route path="/my-page" element={<Navigate to="/profile" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
