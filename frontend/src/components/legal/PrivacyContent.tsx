/**
 * 개인정보처리방침 본문 — 회원가입 모달과 /privacy 페이지에서 동일하게 import.
 * 외곽 wrapper(max-w/padding/scroll)는 호출자 책임. 본문 트리만 노출.
 * 시안 출처: Figma node 1341:6866 (PM 컨펌 버전, 2026-05-04 시행)
 */
export default function PrivacyContent() {
  return (
    <div className="flex flex-col gap-6 text-black">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제1조 개인정보처리방침</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 아이로(이하 '회사')는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령상의 개인정보 보호 규정을 준수합니다.</p>
          <p>2. 회사는 본 방침을 서비스 내 또는 홈페이지에 공개하여 이용자가 언제든 쉽게 확인할 수 있도록 합니다.</p>
          <p>3. 본 방침은 회사의 서비스 운영 목적 및 기술적 변경사항에 따라 개정될 수 있으며, 개정 시 사전에 공지합니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제2조 개인정보 수집/이용 목적, 항목</h2>
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-medium leading-5">회사는 서비스 제공 및 AI 고도화를 위해 필요한 최소한의 개인정보를 수집하며, 특히 임상 데이터는 가명처리하여 활용할 수 있습니다.</p>

          <div className="flex flex-col gap-2">
            <ol className="list-decimal pl-[21px] font-semibold leading-5" start={1}>
              <li>회원가입 및 관리</li>
            </ol>
            <div className="flex flex-col gap-2 pl-3 leading-5">
              <p>수집항목: 이메일, ID, 비밀번호, 닉네임, 면허, 치료영역</p>
              <p>이용목적: 치료사 본인 식별, 자격 확인, 계정 관리</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <ol className="list-decimal pl-[21px] font-semibold leading-5" start={2}>
              <li>서비스 제공 및 AI 고도화</li>
            </ol>
            <div className="flex flex-col gap-2 pl-3 leading-5">
              <p>수집항목: 서비스 이용 기록</p>
              <p>이용목적: 커뮤니티 서비스 제공, AI 기술 고도화 및 통계 분석</p>
              <p>가명정보: 수집된 임상 데이터는 특정 개인을 알아볼 수 없는 형태로 가명처리(익명화)하여 학술 연구 및 AI 학습 목적으로 영구히 활용될 수 있습니다.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <ol className="list-decimal pl-[21px] font-semibold leading-5" start={3}>
              <li>기타 자동 수집 항목</li>
            </ol>
            <div className="flex flex-col gap-2 pl-3 leading-5">
              <p>수집항목: 서비스 이용 기록, 접속 빈도, 접속 로그, 기기 정보</p>
              <p>이용목적: 서비스 개선을 위한 통계 분석 및 개인화된 서비스 환경 구축</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제3조 개인정보 보유기간 및 파기</h2>
        <div className="flex flex-col gap-3 text-sm leading-5">
          <p className="font-medium">1. 회사는 회원가입 시점부터 서비스를 제공하는 기간 동안에만 정보를 이용하며, 회원탈퇴 요청 시 지체없이 파기합니다.</p>
          <div className="flex flex-col gap-[3px]">
            <p className="font-medium">2. 단, 관련 법령에 따라 다음 정보는 일정기간 보관합니다.</p>
            <div className="flex flex-col gap-[3px] pl-3">
              <p>- 권리 침해 및 유해정보 신고 이력: 5년</p>
              <p>- CS 문의 대응 정보(이메일, 연락처): 탈퇴일로부터 1년</p>
            </div>
          </div>
          <p className="font-medium">3. 파기방법: 전자적 파일은 재생할 수 없는 기술적 방법으로 삭제하며, 종이문서는 분쇄기로 분쇄하여 파기합니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제4조 개인정보 처리 위탁 및 제3자 제공</h2>
        <div className="flex flex-col gap-2 text-sm font-medium leading-5">
          <p>1. 회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령의 규정에 의거하거나 수사 목적으로 요구가 있는 경우는 예외로 합니다.</p>
          <p>2. 회사는 원활한 서비스 제공을 위해 클라우드 서버 운영 등을 위탁하고 있으며, 수탁업체가 법령을 준수하도록 관리·감독합니다.</p>
          <p>3. 서비스 안정성을 위해 일부 데이터가 국외(해외 서버)로 이전될 수 있으며, 이용자는 고객센터를 통해 이를 거부할 수 있으나 거부 시 서비스 이용이 불가능할 수 있습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제5조 개인정보 안정성 확보 조치</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>회사는 개인정보 보호를 위해 다음과 같은 안정성 확보 조치를 시행합니다.</p>
          <div className="flex flex-col gap-2">
            <p>1. 기술적 조치: 개인정보 암호화 및 암호화된 통신구간 이용, 해킹 대비 시스템 설치 및 외부 접근 통제</p>
            <p>2. 관리적 조치: 개인정보 취급자 최소화, 개인정보 취급자 대상 정기 보안 교육 실시</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제6조 이용자의 권리와 행사 방법</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <div className="flex flex-col gap-2">
            <p>이용자는 자신의 개인정보 처리에 관하여 아래와 같은 권리를 가질 수 있습니다.</p>
            <div className="flex flex-col gap-2">
              <p>- 개인정보 열람(조회)을 요구할 권리</p>
              <p>- 개인정보 정정을 요구할 권리</p>
              <p>- 개인정보 처리정지를 요구할 권리</p>
              <p>- 개인정보 삭제 요구 및 동의 철회/탈퇴를 요구할 권리</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p>1. 이용자는 개인정보 열람, 정정, 처리정지, 삭제 및 동의 철회를 요구할 권리가 있습니다.</p>
            <p>2. 권리 행사는 앱 내 설정 또는 고객센터 상담을 통해 가능합니다.</p>
            <p>3. 회사는 이용자가 개인정보의 오류에 대한 정정을 요청한 경우, 정정 완료 전까지 해당 개인정보를 이용하거나 제공하지 않습니다.</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제7조 개인정보 보호책임자</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>회사는 개인정보 보호 업무를 총괄하기 위해 아래와 같이 보호책임자를 지정하고 있습니다.</p>
          <p>책임자: 류영현(대표이사)</p>
          <p>이메일: fbdudgus3693@gmail.com</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제8조 이용자 권익침해에 대한 구제방법</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>개인정보 침해에 대한 신고나 상담은 아래 기관을 통해 가능합니다.</p>
          <div className="flex flex-col gap-3">
            <p>- 대검찰청 사이버수사과: 1301 / cybercid.spo.go.kr</p>
            <p>- 개인정보침해신고센터: (국번없이) 118 / privacy.kisa.or.kr</p>
            <p>- 개인정보 분쟁조정위원회: 1833-6972 / www.kopico.go.kr</p>
            <p>- 경찰청 사이버수사국: 182 / ecrm.police.go.kr</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제9조 개인정보처리방침 변경</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>본 방침의 개정 시 시행 최소 7일 전에 변경 사항을 사전에 안내합니다.</p>
          <p>다만, 이용자의 권리에 중대한 변경이 발생하는 경우에는 최소 30일 전에 고지합니다.</p>
        </div>
      </section>

      <div className="flex flex-col text-sm font-medium leading-5 text-center">
        <p>공고일: 2026년 05월 04일</p>
        <p>시행일: 2026년 05월 04일</p>
      </div>
    </div>
  );
}
