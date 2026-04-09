import { Link } from 'react-router-dom'
import { Bell, TrendingUp, ThumbsUp, Eye } from 'lucide-react'
import { buttonVariants } from '@/components/shadcn-ui/button'
import { Card, CardContent } from '@/components/shadcn-ui/card'

const announcements = [
  { id: 1, title: '멜로미 커뮤니티에 오신 것을 환영합니다!', date: '2026.03.05' },
  { id: 2, title: '임상 톡톡에서 케이스 스터디를 시작해보세요', date: '2026.03.04' },
]

const popularPosts = [
  {
    id: 1,
    category: '임상 톡톡',
    title: '5세 아동의 언어 발달 지연 케이스',
    ageRange: '유아기 (만 3~5세)',
    diagnosis: '언어발달지연',
    therapyArea: '언어치료',
    views: 234,
    likes: 45,
    comments: 12,
  },
  {
    id: 2,
    category: '임상 톡톡',
    title: 'ADHD 아동의 감각통합 접근법 공유',
    ageRange: '아동기 (만 6~12세)',
    diagnosis: 'ADHD',
    therapyArea: '작업치료',
    views: 189,
    likes: 38,
    comments: 8,
  },
  {
    id: 3,
    category: '임상 톡톡',
    title: '놀이치료에서 경계선 설정 방법',
    ageRange: '유아기 (만 3~5세)',
    diagnosis: '미분류',
    therapyArea: '놀이치료',
    views: 156,
    likes: 29,
    comments: 15,
  },
]

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Hero */}
      <section className="bg-white border-2 border-gray-300 rounded-lg p-8 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            치료사와 함께하는<br />따뜻한 성장 커뮤니티
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            업무 고립감 해소부터 전문성 강화까지,<br />
            멜로미와 함께 성장하세요
          </p>
          <div className="flex gap-4">
            <Link to="/posts" className={buttonVariants({ size: 'lg' })}>임상 톡톡 시작하기</Link>
            <Link to="/login" className={buttonVariants({ size: 'lg', variant: 'outline' })}>더 알아보기</Link>
          </div>
        </div>
      </section>

      {/* 공지사항 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={24} className="text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">공지사항</h2>
        </div>
        <div className="bg-white border-2 border-gray-300 rounded-lg divide-y divide-gray-300">
          {announcements.map((a) => (
            <div key={a.id} className="p-4 flex justify-between items-center">
              <span className="text-gray-900">{a.title}</span>
              <span className="text-gray-500 text-sm">{a.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 인기 게시글 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={24} className="text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">인기 게시글</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {popularPosts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`}>
              <Card className="hover:border-gray-400 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded">{post.category}</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded">{post.therapyArea}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <div className="flex gap-3 text-sm text-gray-500 mb-3">
                    <span>{post.ageRange}</span>
                    <span>•</span>
                    <span>{post.diagnosis}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={16} />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 피처 카드 */}
      <section className="mt-8 grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold text-gray-900 mb-2">전문성 강화</h3>
            <p className="text-sm text-gray-600">
              익명 기반 케이스 스터디로<br />임상 전문성을 키워요
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-bold text-gray-900 mb-2">업무 효율화</h3>
            <p className="text-sm text-gray-600">
              치료 자료 공유로<br />퇴근 시간을 앞당겨요
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="font-bold text-gray-900 mb-2">심리적 유대감</h3>
            <p className="text-sm text-gray-600">
              동료 치료사들과<br />고립감을 해소해요
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
