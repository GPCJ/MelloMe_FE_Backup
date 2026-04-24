import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            멜로미
          </Link>
          <span className="text-xs text-gray-400">시행일 2026-04-24</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          본 문서는 검토 중인 초안입니다. 최종 법적 검토 전 참고용으로만 사용해 주세요.
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-500 mb-8">
          멜로미(이하 “회사”)는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수하기 위해 아래와 같이 개인정보처리방침을 수립하여 공개합니다.
        </p>

        <section className="space-y-8 text-sm leading-7 text-gray-700">
          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. 수집하는 개인정보 항목</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원가입 시: 이메일, 비밀번호(암호화 저장), 닉네임</li>
              <li>선택 입력: 프로필 이미지, 자기소개</li>
              <li>치료사 인증 시: 이름, 자격증 이미지, 치료 영역 정보</li>
              <li>서비스 이용 과정에서 자동 수집: 접속 IP, 브라우저 정보, 쿠키, 서비스 이용 기록</li>
            </ul>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 식별 및 본인 확인, 로그인 유지</li>
              <li>커뮤니티 서비스 제공(게시글·댓글·리액션)</li>
              <li>치료사 자격 인증 및 관리</li>
              <li>서비스 개선을 위한 통계 분석 및 사용자 경험(UX) 측정</li>
              <li>부정 이용 방지 및 관련 법령 준수</li>
            </ul>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <p>
              회원 탈퇴 시까지 보유하며, 탈퇴 즉시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우에는 해당 기간 동안 보관합니다.
            </p>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. 개인정보의 제3자 제공</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 법령에 근거하거나 수사기관의 적법한 요청이 있는 경우에 한해 제공할 수 있습니다.
            </p>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. 개인정보 처리의 위탁</h2>
            <p className="mb-2">
              회사는 서비스 제공을 위해 아래와 같이 일부 업무를 외부 전문 업체에 위탁하고 있습니다.
            </p>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">수탁 업체</th>
                  <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">Google LLC</td>
                  <td className="border border-gray-200 px-3 py-2">Google Analytics 4 기반 서비스 이용 통계 분석</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">Microsoft Corporation</td>
                  <td className="border border-gray-200 px-3 py-2">Microsoft Clarity 기반 사용자 경험(UX) 분석 및 세션 기록</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">Vercel Inc.</td>
                  <td className="border border-gray-200 px-3 py-2">프론트엔드 웹사이트 호스팅</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">Amazon Web Services</td>
                  <td className="border border-gray-200 px-3 py-2">서버 인프라 및 파일 저장소 운영</td>
                </tr>
              </tbody>
            </table>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. 쿠키 및 분석 도구 사용</h2>
            <p>
              회사는 서비스 개선을 위해 Google Analytics 4 및 Microsoft Clarity를 사용합니다. 해당 도구는 브라우저에 쿠키를 저장하여 페이지 조회·클릭·세션 흐름 등의 정보를 수집하며, 이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. 단, 쿠키 저장을 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. 정보주체의 권리</h2>
            <p>
              이용자는 언제든지 본인의 개인정보에 대한 열람, 수정, 삭제, 처리정지, 동의 철회를 요청할 수 있으며, 회사는 관련 법령에 따라 지체 없이 조치합니다.
            </p>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. 개인정보의 파기 절차 및 방법</h2>
            <p>
              개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우, 전자적 파일은 복구할 수 없도록 영구 삭제하고 서면 문서는 분쇄 또는 소각합니다.
            </p>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. 개인정보 보호책임자</h2>
            <p className="mb-1">문의사항은 아래 연락처로 연락해 주시기 바랍니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>이메일: melonnebuilders@gmail.com</li>
            </ul>
          </article>

          <article>
            <h2 className="text-base font-semibold text-gray-900 mb-2">10. 고지의 의무</h2>
            <p>
              본 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 경우 개정 최소 7일 전부터 공지사항을 통해 사전 공지합니다.
            </p>
            <p className="mt-3 text-xs text-gray-400">최종 개정일: 2026-04-24</p>
          </article>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-400">© 2026 멜로미</div>
      </footer>
    </div>
  );
}
