import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  ThumbsUp,
  Heart,
  Download,
  Bookmark,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMyDashboard, fetchMyPosts, fetchMyActivity } from '../api/mypage';
import { useAuthStore } from '../stores/useAuthStore';
import type { MyDashboard, MyActivity } from '../types/mypage';
import type { PostSummary } from '../types/post';

const THERAPY_AREA_LABELS: Record<string, string> = {
  OCCUPATIONAL_THERAPY: '작업치료',
  SPEECH_THERAPY: '언어치료',
  COGNITIVE_THERAPY: '인지치료',
  PLAY_THERAPY: '놀이치료',
};

const ROLE_LABELS: Record<string, string> = {
  THERAPIST: '치료사',
  ADMIN: '관리자',
  USER: '일반 회원',
};

type Tab = 'dashboard' | 'posts' | 'activity' | 'verification';

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'posts', label: '내가 쓴 글' },
  { key: 'activity', label: '활동 내역' },
  { key: 'verification', label: '자격 인증' },
];

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function daysSince(isoString: string) {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000);
}

// ─── 대시보드 탭 ──────────────────────────────────────────────────
function DashboardTab({ dashboard }: { dashboard: MyDashboard }) {
  const { stats, activity } = dashboard;

  const statCards = [
    { icon: FileText, label: '작성한 게시글', value: stats.postCount },
    { icon: MessageSquare, label: '작성한 댓글', value: stats.commentCount },
    { icon: ThumbsUp, label: '받은 반응', value: stats.receivedReactionCount },
    { icon: Heart, label: '준 반응', value: stats.givenReactionCount },
    { icon: Download, label: '다운로드', value: stats.downloadCount },
    { icon: Bookmark, label: '스크랩', value: stats.scrappedCount },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-1.5 text-gray-400 mb-2">
              <Icon size={14} />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">활동 요약</p>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">이번 주 작성한 게시글</span>
            <span className="font-medium text-gray-900">{activity.weeklyPostCount}개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">이번 주 작성한 댓글</span>
            <span className="font-medium text-gray-900">{activity.weeklyCommentCount}개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">가입일</span>
            <span className="font-medium text-gray-900">
              {formatDate(activity.joinedAt)} ({daysSince(activity.joinedAt)}일째)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 내가 쓴 글 탭 ────────────────────────────────────────────────
function MyPostsTab({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">작성한 글이 없어요.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => {
        const therapyLabel =
          post.therapyArea && post.therapyArea !== 'UNSPECIFIED'
            ? THERAPY_AREA_LABELS[post.therapyArea]
            : null;

        return (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                {therapyLabel && (
                  <Badge variant="secondary" className="text-xs">{therapyLabel}</Badge>
                )}
                <span className="text-xs text-gray-400 ml-auto">{formatDate(post.createdAt)}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">{post.title}</p>
              <div className="flex gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Heart size={12} /> {post.likeCount}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.commentCount}</span>
                <span>조회 {post.viewCount}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── 활동 내역 탭 ─────────────────────────────────────────────────
function ActivityTab({ activity }: { activity: MyActivity }) {
  const { commentedPosts, scrappedPosts } = activity;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">댓글 단 게시글</h3>
        {commentedPosts.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">댓글 단 게시글이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {commentedPosts.map(({ post, myCommentPreview, myCommentCreatedAt }) => (
              <Link key={post.id} to={`/posts/${post.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{post.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mb-2">{myCommentPreview}</p>
                  <span className="text-xs text-gray-400">{formatDate(myCommentCreatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">스크랩한 게시글</h3>
        {scrappedPosts.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">스크랩한 게시글이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {scrappedPosts.map(({ post, scrappedAt }) => {
              const therapyLabel =
                post.therapyArea && post.therapyArea !== 'UNSPECIFIED'
                  ? THERAPY_AREA_LABELS[post.therapyArea]
                  : null;
              return (
                <Link key={post.id} to={`/posts/${post.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                    {therapyLabel && (
                      <Badge variant="secondary" className="text-xs mb-2">{therapyLabel}</Badge>
                    )}
                    <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">{post.title}</p>
                    <p className="text-xs text-gray-400">{post.author.nickname} · {formatDate(scrappedAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── 자격 인증 탭 ─────────────────────────────────────────────────
type VerificationStatus = 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | null;

function VerificationTab({ status }: { status: VerificationStatus }) {
  const statusConfig = {
    PENDING: {
      icon: Clock,
      label: '인증 심사 중',
      description: '제출하신 자격증이나 면허증을 검토 중입니다.',
      note: '심사는 영업일 기준 3~5일 소요됩니다.',
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClass: 'text-yellow-600',
    },
    APPROVED: {
      icon: CheckCircle,
      label: '인증 완료',
      description: '치료사 인증이 완료되었습니다.',
      note: '커뮤니티의 모든 기능을 이용하실 수 있습니다.',
      className: 'bg-green-50 border-green-200 text-green-800',
      iconClass: 'text-green-600',
    },
    REJECTED: {
      icon: XCircle,
      label: '인증 반려',
      description: '제출하신 서류가 반려되었습니다.',
      note: '올바른 서류를 다시 제출해주세요.',
      className: 'bg-red-50 border-red-200 text-red-800',
      iconClass: 'text-red-600',
    },
  };

  const documents = [
    '작업치료사/언어재활사/상담심리사 면허증',
    '놀이치료사 자격증 (한국놀이치료학회 등)',
    '재학생의 경우 학생증 (관련 학과)',
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">자격 인증 현황</p>
        {status === null || status === 'NOT_REQUESTED' ? (
          <p className="text-sm text-gray-400">아직 자격 인증을 신청하지 않으셨어요.</p>
        ) : (
          (() => {
            const config = statusConfig[status];
            const Icon = config.icon;
            return (
              <div className={`rounded-lg border p-3 ${config.className}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={config.iconClass} />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <p className="text-xs mb-0.5">{config.description}</p>
                <p className="text-xs opacity-80">{config.note}</p>
              </div>
            );
          })()
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">인증 가능 서류</p>
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc} className="flex items-start gap-2 text-sm text-gray-500">
              <span className="mt-2 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
              {doc}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── 스켈레톤 ─────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Skeleton className="h-4 w-20 mb-3" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────
export default function MyPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [dashboard, setDashboard] = useState<MyDashboard | null>(null);
  const [myPosts, setMyPosts] = useState<PostSummary[] | null>(null);
  const [activity, setActivity] = useState<MyActivity | null>(null);

  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard' && !dashboard) {
      setLoadingDashboard(true);
      fetchMyDashboard().then(setDashboard).finally(() => setLoadingDashboard(false));
    }
    if (activeTab === 'posts' && !myPosts) {
      setLoadingPosts(true);
      fetchMyPosts().then(setMyPosts).finally(() => setLoadingPosts(false));
    }
    if (activeTab === 'activity' && !activity) {
      setLoadingActivity(true);
      fetchMyActivity().then(setActivity).finally(() => setLoadingActivity(false));
    }
  }, [activeTab]);

  const verificationStatus = user?.therapistVerification?.status ?? null;
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-300 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {user?.nickname?.[0] ?? '?'}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-base">{user?.nickname}</p>
          <p className="text-sm text-gray-400 mt-0.5">{roleLabel}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'dashboard' && (
        loadingDashboard || !dashboard
          ? <DashboardSkeleton />
          : <DashboardTab dashboard={dashboard} />
      )}
      {activeTab === 'posts' && (
        loadingPosts || !myPosts
          ? <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
          : <MyPostsTab posts={myPosts} />
      )}
      {activeTab === 'activity' && (
        loadingActivity || !activity
          ? <div className="flex flex-col gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
          : <ActivityTab activity={activity} />
      )}
      {activeTab === 'verification' && (
        <VerificationTab status={verificationStatus} />
      )}
    </div>
  );
}
