import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);

  const verificationStatus = user?.therapistVerification?.status ?? null;
  const isVerified = user?.canAccessCommunity === true;
  const isNotRequested = !!user && (verificationStatus === 'NOT_REQUESTED' || verificationStatus === 'REJECTED' || verificationStatus === 'PENDING');

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-11 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[10px] flex justify-center items-center">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">멜로미</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors">주요 기능</a>
            <a href="#about" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors">멜로미의 장점</a>
            <a href="#community" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors">커뮤니티 소개</a>
          </div>
          <div className="flex items-center gap-3">
            {isVerified ? (
              <Link to="/posts" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity">
                커뮤니티 바로가기
              </Link>
            ) : isNotRequested ? (
              <Link to="/therapist-verifications" className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors">
                치료사 인증하기
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg transition-colors">
                  로그인
                </Link>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity">
                  시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-9 flex items-center gap-16">
          {/* Left */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-8">
              <span className="text-purple-700 text-sm font-medium">치료사가 만든, 치료사를 위한 공간</span>
            </div>
            <h1 className="text-6xl font-bold leading-[75px] text-gray-900 mb-6">
              혼자가 아니에요,<br />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                함께 성장해요
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-8 mb-10">
              사설 센터에서 홀로 고민하던 저년차 치료사님,<br />
              멜로미에서 익명으로 케이스를 나누고, 선배님들의 활동지를 참고하며<br />
              동료들과 함께 성장하세요.
            </p>
            <div className="flex items-center gap-4 mb-10">
              {isVerified ? (
                <Link
                  to="/posts"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  커뮤니티 바로가기 →
                </Link>
              ) : isNotRequested ? (
                <Link
                  to="/therapist-verifications"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-lg font-medium rounded-lg transition-colors"
                >
                  치료사 인증하기 →
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  지금 시작하기 →
                </Link>
              )}
              <a
                href="#about"
                className="inline-flex items-center px-8 py-2.5 bg-white text-neutral-950 text-lg font-medium rounded-lg border-2 border-black/10 hover:bg-gray-50 transition-colors"
              >
                더 알아보기
              </a>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold text-gray-900">1,200+</div>
                <div className="text-sm text-gray-600">함께하는 치료사</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="text-3xl font-bold text-gray-900">5,000+</div>
                <div className="text-sm text-gray-600">공유된 활동지</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="text-3xl font-bold text-gray-900">익명</div>
                <div className="text-sm text-gray-600">안전한 소통</div>
              </div>
            </div>
          </div>
          {/* Right - Image */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl blur-3xl" />
            <img
              className="relative w-full aspect-[616/500] rounded-3xl shadow-2xl object-cover"
              src="https://placehold.co/616x500"
              alt="멜로미 커뮤니티"
            />
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section id="community" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-9">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 rounded-full mb-6">
              <span className="text-purple-700 text-sm font-medium">활발한 커뮤니티</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">이미 많은 치료사들이 함께하고 있어요</h2>
            <p className="text-xl text-gray-600">혼자였던 치료사님, 멜로미에서는 1,200명의 동료와 함께해요</p>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-16">
            {[
              { icon: '👥', color: 'from-purple-500 to-purple-600', number: '1,200+', title: '함께하는 치료사', desc: '작업·언어·인지·놀이 등 다양한 영역의 치료사들이 활동 중' },
              { icon: '💬', color: 'from-pink-500 to-pink-600', number: '3,500+', title: '나눈 케이스', desc: '익명으로 안전하게 공유된 임상 사례와 조언' },
              { icon: '📁', color: 'from-blue-500 to-blue-600', number: '5,000+', title: '공유된 활동지', desc: '검증된 치료 자료와 행정 템플릿 아카이브' },
              { icon: '✅', color: 'from-green-500 to-green-600', number: '100%', title: '치료사 인증', desc: '자격증 확인을 통한 안전한 커뮤니티 운영' },
            ].map(({ icon, color, number, title, desc }) => (
              <div key={title} className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 flex flex-col items-center text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-xl mb-4`}>
                  {icon}
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>{number}</div>
                <div className="text-base font-semibold text-gray-900 mb-2">{title}</div>
                <div className="text-sm text-gray-600">{desc}</div>
              </div>
            ))}
          </div>

          {/* Community Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-96">
            <img className="w-full h-full object-cover" src="https://placehold.co/1280x400" alt="커뮤니티" />
            <div className="absolute inset-0 bg-gradient-to-l from-purple-900/60 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-3xl font-bold text-white mb-2">아기자기하고 따뜻한 우리만의 공간</h3>
              <p className="text-lg text-purple-100">2030 여성 치료사들이 만든, 치료사를 위한 커뮤니티</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto px-9">
          <div className="text-center mb-16">
            <div className="inline-block px-5 py-2 bg-purple-100 rounded-full mb-6">
              <span className="text-purple-700 text-sm font-medium">멜로미가 해결해드려요</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">치료사님의 고민, 함께 풀어요</h2>
            <p className="text-xl text-gray-600">업무 고립감부터 케이스 고민까지, 멜로미에서 동료들과 함께 해결하세요</p>
          </div>
          <div id="about" className="grid grid-cols-3 gap-6">
            {[
              { emoji: '🔐', title: '안전한 인증', desc: '자격증으로 치료사임을 확인해요' },
              { emoji: '🤝', title: '따뜻한 커뮤니티', desc: '서로를 응원하고 존중하는 문화' },
              { emoji: '🚀', title: '함께 성장', desc: '전문성과 웰빙, 모두 챙겨요' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl shadow-sm border border-purple-100 p-8 flex flex-col items-center text-center">
                <div className="text-4xl mb-4">{emoji}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{title}</div>
                <div className="text-sm text-gray-600">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-9">
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl overflow-hidden px-16 py-20 text-center">
            <span className="absolute left-10 top-10 text-4xl opacity-20 select-none">💙</span>
            <span className="absolute right-10 top-20 text-4xl opacity-20 select-none">✨</span>
            <span className="absolute left-20 bottom-10 text-4xl opacity-20 select-none">🌱</span>
            <span className="absolute right-10 bottom-10 text-4xl opacity-20 select-none">💫</span>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-8">
              <span className="text-white text-sm font-medium">지금 시작하세요</span>
            </div>
            <h2 className="text-5xl font-bold text-white leading-[60px] mb-6">
              혼자 고민하지 마세요,<br />멜로미에서 함께해요
            </h2>
            <p className="text-xl text-purple-50 leading-8 mb-10">
              치료사 자격증만 있으면 누구나 가입할 수 있어요.<br />
              익명으로 안전하게, 동료들과 함께 성장하는 경험을 시작하세요.
            </p>
            {isVerified ? (
              <Link
                to="/posts"
                className="inline-flex items-center gap-3 px-8 py-2.5 bg-green-500 text-white text-lg font-medium rounded-lg shadow-xl cursor-default"
              >
                인증 완료 ✓
              </Link>
            ) : isNotRequested ? (
              <Link
                to="/therapist-verifications"
                className="inline-flex items-center gap-3 px-8 py-2.5 bg-white text-violet-600 text-lg font-medium rounded-lg shadow-xl hover:bg-violet-50 transition-colors"
              >
                치료사 인증하기 →
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-3 px-8 py-2.5 bg-white text-purple-600 text-lg font-medium rounded-lg shadow-xl hover:bg-purple-50 transition-colors"
              >
                치료사 인증하고 시작하기 →
              </Link>
            )}
            <div className="flex justify-center items-center gap-6 mt-8">
              {['무료 가입', '완전 익명 보장', '치료사만 입장'].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-100 text-xs">✓</span>
                  </div>
                  <span className="text-purple-100 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-9">
          <div className="grid grid-cols-4 gap-12 mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[10px] flex justify-center items-center">
                  <span className="text-white text-lg font-bold">M</span>
                </div>
                <span className="text-xl font-semibold text-white">멜로미</span>
              </div>
              <p className="text-sm text-gray-300 leading-6">
                치료사가 만든, 치료사를 위한 커뮤니티<br />
                함께 성장하고 서로를 응원해요
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-lg font-semibold text-white mb-1">커뮤니티</div>
              {['작업치료 게시판', '언어치료 게시판', '인지치료 게시판', '놀이치료 게시판', '자료 공유'].map((item) => (
                <span key={item} className="text-sm text-gray-300">{item}</span>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-lg font-semibold text-white mb-1">서비스</div>
              {['케이스 스터디', '멘토-멘티 매칭', '활동지 아카이브', '공지사항'].map((item) => (
                <span key={item} className="text-sm text-gray-300">{item}</span>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-lg font-semibold text-white mb-1">문의</div>
              <span className="text-sm text-gray-300">hello@melomi.kr</span>
              <span className="text-sm text-gray-300">오픈채팅방 문의</span>
              <span className="text-sm text-gray-300">@melomi_official</span>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex justify-between items-center">
            <span className="text-sm text-gray-300">© 2026 멜로미. All rights reserved.</span>
            <div className="flex gap-6">
              {['이용약관', '개인정보처리방침', '커뮤니티 가이드라인'].map((item) => (
                <span key={item} className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
