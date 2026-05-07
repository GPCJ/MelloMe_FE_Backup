/**
 * 이용약관 본문 — 회원가입 모달과 /terms 페이지에서 동일하게 import.
 * 외곽 wrapper(max-w/padding/scroll)는 호출자 책임. 본문 트리만 노출.
 * 시안 출처: Figma node 1302:7545 (PM 컨펌 버전, 2026-05-04 시행)
 */
export default function TermsContent() {
  return (
    <div className="flex flex-col gap-6 text-black">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제1조 목적</h2>
        <p className="text-sm font-medium leading-5">
          본 약관은 아이로(이하 '회사')가 운영하여 이용자에게 제공하는 소프트웨어, 어플리케이션, 프로덕트, 문서, 기타 모든 제품 및 서비스(이하 '서비스')를 이용함에 있어서 이용자와 회사의 권리·의무, 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제2조 용어의 정의</h2>
        <div className="flex flex-col gap-3 text-sm font-medium">
          <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <div className="flex flex-col gap-3 leading-5">
            <p>- 서비스: 이용자가 임상 지식, 교구 정보, 구인구직 등 전문 정보를 공유하고 소통할 수 있는 커뮤니티 플랫폼을 의미합니다.</p>
            <p>- 이용자(또는 회원): 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 의미합니다.</p>
            <p>- 게시물: 회원이 서비스를 이용하는 과정에서 입력하는 글, 사진, 영상, 질문 및 답변 등의 일체 정보를 의미합니다.</p>
            <p>- 가명정보: 게시물 내 포함된 정보 중 특정 개인을 알아볼 수 없도록 익명화 처리한 정보를 의미합니다.</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제3조 약관의 효력과 개정</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 본 약관은 서비스 내 게시 또는 기타 방식으로 공지함으로써 효력을 가집니다.</p>
          <p>2. 회사는 법령 변경 또는 서비스 개선을 위해 본 약관을 개정할 수 있습니다.</p>
          <p>3. 회사가 약관을 개정할 경우에는 적용 일자 및 개정 사유를 명시하여 현행 약관과 함께 서비스의 초기화면에 그 개정 약관의 적용 일자 7일 전부터 적용 일자 전일까지 공지합니다. 다만, 회원에게 불리한 약관 개정의 경우 그 적용 일자 30일 전부터 공지하며, 공지 외에 일정 기간 내에 전자우편(E-MAIL), 로그인 시 동의 창 등의 전자적 수단을 통하여 명확히 통지합니다.</p>
          <p>4. 이용자가 변경된 약관 효력발생일로부터 7일의 기간 내에 명시적으로 거부 의사를 표시하지 않는 경우, 개정 약관에 동의한 것으로 간주합니다.</p>
          <p>5. 이용자가 개정 약관에 동의하지 않을 경우, 서비스 이용을 중단하고 회원탈퇴를 요청할 수 있습니다.</p>
          <p>6. 회사가 제3항의 절차를 모두 준수하였음에도 변경된 약관에 대한 정보를 알지 못하여 발생하는 회원의 피해에 대하여 회사는 책임지지 않습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제4조 약관에 명시되지 않은 사항</h2>
        <div className="flex flex-col gap-2 text-sm font-medium leading-5">
          <p>- 회사는 필요한 경우 특정 서비스에 관하여 별도의 이용약관 및 운영정책(이하 '세부지침')을 정할 수 있으며, 해당 내용이 본 약관과 상충할 경우에는 세부지침이 우선하여 적용됩니다.</p>
          <p>- 본 약관에서 정하지 아니한 사항은 준거법, 규정, 상관습 및 운영정책에 따릅니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제5조 서비스 이용계약의 체결</h2>
        <div className="flex flex-col gap-3 text-sm leading-5">
          <p className="font-medium">1. 이용계약은 회원이 되고자 하는 자(이하 '가입신청자')가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고, 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
          <div className="flex flex-col gap-2">
            <p className="font-medium">2. 회사는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙하지 않거나 사후에 이용계약을 해지할 수 있습니다.</p>
            <div className="flex flex-col gap-2 pl-3">
              <p>- 가입신청자가 이전에 본 약관에 의하여 회원자격을 상실한 적이 있는 경우</p>
              <p>- 타인의 명의를 이용하거나 허위 정보를 기재한 경우</p>
              <p>- 회사에서 정한 자격 요건(치료사 면허 등)이 확인되지 않는 경우</p>
              <p>- 기타 회사가 정한 이용 신청 요건에 미비가 있는 경우</p>
              <p>- 회사의 설비 또는 서비스상의 장애 사유가 발생하여 이용신청 승낙이 일시적으로 어려운 경우</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제6조 자격 확인 및 증빙</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 회사는 전문적인 서비스 제공 및 커뮤니티 내 전문 정보의 안전한 관리를 위해 가입신청자에게 치료사 면허 번호 등 자격 증빙을 위한 정보를 요청할 수 있습니다.</p>
          <p>2. 이용자는 반드시 본인의 실제 자격 정보를 입력해야 하며, 회사는 필요시 별도의 증빙서류 제출을 요구할 수 있습니다.</p>
          <p>3. 이용자가 입력한 자격 정보가 허위로 판명되거나 타인의 정보를 도용한 경우, 회사는 즉시 해당 이용자의 이용을 중지하고 관련 법적 조치를 취할 수 있습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-bold leading-none">제7조 회원정보의 변경</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 다만 서비스 관리를 위해 아이디(ID), 이름 등은 수정이 불가능합니다.</p>
          <p>2. 회원은 회원가입 신청 시 기재한 사항이 변경되었을 경우, 온라인으로 수정하거나 이메일 등 기타 방법으로 회사에 그 변경사항을 알려야 합니다.</p>
          <p>3. 제2항의 변경사항을 회사에 알리지 않아 발생한 불이익에 대하여 회사는 책임지지 않습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제8조 회원 아이디 및 비밀번호의 관리에 대한 의무</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 회원의 아이디와 비밀번호에 관한 관리 책임은 회원에게 있으며, 이를 제3자가 이용하도록 하여서는 안됩니다.</p>
          <p>2. 회원은 아이디 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 이를 즉시 회사에 통지하고 회사의 안내에 따라야 합니다.</p>
          <p>3. 제2항의 경우 해당 회원이 회사에 그 사실을 통지하지 않거나, 통지한 경우에도 회사의 안내에 따르지 않아 발생한 불이익에 대하여 회사는 책임지지 않습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제9조 서비스의 내용</h2>
        <div className="flex flex-col gap-2 text-sm font-medium">
          <p className="leading-5">회사가 회원에게 제공하는 서비스의 내용은 다음과 같습니다.</p>
          <div className="flex flex-col gap-3">
            <p className="leading-5">- 회사는 이용자 간 정보 공유, 임상 자료 교환, 전문 네트워킹 등의 커뮤니티 기능을 제공합니다.</p>
            <ul className="list-disc pl-[18px] text-xs leading-4">
              <li>회원은 커뮤니티에 작성한 게시물(텍스트, 이미지 등)가 개인을 식별할 수 없는 가명정보 형태로 변환되어 AI 기술 고도화, 통계 분석, 학술 연구 목적으로 영구히 활용될 수 있음에 동의합니다.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제10조 서비스의 변경 및 중단</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 회사는 상당한 이유가 있는 경우 운영상, 기술상의 필요에 따라 제공하고 있는 서비스의 전부 또는 일부를 변경할 수 있습니다.</p>
          <p>2. 회사는 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스 제공을 일시적으로 중단할 수 있습니다.</p>
          <p>3. 회사는 제2항의 사유로 서비스 제공이 중단되는 경우, 제3조에서 정한 방법으로 이용자에게 사전 고지합니다. 다만, 회사가 사전에 통제할 수 없는 부득이한 사유가 있는 경우 사후에 통지할 수 있습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제11조 데이터의 관리 및 저장</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 이용자가 서비스를 통해 입력한 게시물 및 자료는 회사가 이용하는 클라우드 서버에 저장됩니다.</p>
          <p>2. 이용자는 자신의 기기나 별도 저장 매체를 통해 데이터를 관리(백업)해야 할 의무가 있으며, 회사의 고의 또는 중과실 없이 발생한 데이터 유실에 대하여 회사는 책임을 지지 않습니다.</p>
          <p>3. 회사는 개인정보처리방침에 명시된 목적(AI 고도화, 통계 분석 등)을 위해, 수집된 데이터를 특정 개인을 알아볼 수 없는 형태로 가명처리하여 활용할 수 있습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제12조 회사의 의무</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.</p>
          <p>2. 회사는 이용자가 안전하게 서비스를 이용할 수 있도록 개인정보 보호를 위한 보안 시스템을 갖추어야 하며, 개인정보처리방침을 고시하고 준수합니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제13조 이용자의 의무</h2>
        <div className="flex flex-col gap-3 text-sm leading-5">
          <div className="flex flex-col gap-2">
            <p className="font-medium">1. 이용자는 서비스를 이용할 때 다음 각 호의 행위를 하여서는 안됩니다.</p>
            <div className="flex flex-col gap-2 pl-3">
              <p>- 이용 신청 또는 정보 변경 시 허위 내용의 등록</p>
              <p>- 타인의 정보 도용 또는 면허 정보를 부정하게 사용하는 행위</p>
              <p>- 회사가 게시한 정보의 변경 및 서비스의 정상적인 운영을 방해하는 행위</p>
              <p>- 회사 및 기타 제3자의 저작권 등 지적재산권을 침해하는 행위</p>
              <p>- 기타 불법적이거나 부당한 행위</p>
            </div>
          </div>
          <p className="font-medium">2. 이용자는 아이디 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우 즉시 회사에 통지하고 회사의 안내에 따라야 합니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제14조 가명정보의 활용에 대한 동의</h2>
        <div className="flex flex-col gap-3 text-sm leading-5">
          <div className="flex flex-col gap-2">
            <p className="font-medium">1. 회사는 개인정보는 파기하되, 이용자가 서비스를 통해 입력한 가명처리된 정보 혹은 게시물 정보는 다음과 같은 목적으로 활용할 수 있으며, 이용자는 본 약관에 동의함으로써 이에 동의한 것으로 간주합니다.</p>
            <div className="flex flex-col gap-2 pl-3">
              <p>- AI(인공지능) 기술 고도화 및 통계 분석</p>
              <p>- 발달장애 및 치료 경향성에 대한 통계 작성 및 학술 연구</p>
              <p>- 신규 기능 개발 및 서비스 개인화</p>
            </div>
          </div>
          <p className="font-medium">2. 회사는 가명정보 처리 시 개인정보 보호법 등 관련 법령에 따른 안정성 확보 조치를 준수하며, 특정 개인을 재식별하기 위한 어떠한 행위도 하지 않습니다.</p>
          <p className="font-medium">3. 본 조에 따른 가명정보의 활용 동의는 이용자가 서비스를 탈퇴한 이후에도 회사가 해당 데이터를 비식별화된 상태로 보유하고 활용하는 것을 포함합니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제15조 이용계약의 해지 및 탈퇴</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 이용자는 언제든지 서비스 내 설정 메뉴 또는 고객센터를 통하여 이용계약 해지(탈퇴)를 신청할 수 있으며, 회사는 관련 법령이 정하는 바에 따라 이를 즉시 처리합니다.</p>
          <p>2. 이용계약이 해지되면 회사는 개인정보처리방침에 따라 이용자의 개인정보를 지체없이 파기합니다. 단, 관계 법령에 따라 보관이 필요한 정보는 해당 기간 동안 별도 분리하여 보관합니다.</p>
          <p>3. 계약 해지 시 이용자가 작성한 계정 정보 및 비공개 보관 자료 등은 복구가 불가능한 방법으로 삭제되므로, 이용자는 해지 전 필요한 데이터를 직접 백업해야 하며, 회사는 해지 후 데이터 복구 요청에 대해 책임을 지지 않습니다.</p>
          <p>4. 전항에도 불구하고, 커뮤니티 게시판 등에 공개적으로 작성된 게시물은 회원 탈퇴 시 자동 삭제되지 않습니다. 커뮤니티의 맥락 유지와 정보 공유를 위해 삭제가 필요한 게시물은 반드시 탈퇴 전 이용자가 직접 삭제해야 하며, 탈퇴 후에는 본인 확인이 불가하여 삭제 지원이 어려울 수 있습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-bold leading-none">제16조 서비스 이용 제한</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 회사는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해하는 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</p>
          <p>2. 회사는 타인의 면허 정보 도용, 개인정보 유출, 해킹 등 중대한 위반 행위가 확인될 경우 즉시 영구이용정지를 할 수 있으며, 이로 인해 발생한 회사의 손해에 대해 배상을 청구할 수 있습니다.</p>
          <p>3. 이용자는 본 조에 따른 이용 제한 등에 대해 회사가 정한 절차에 따라 이의신청을 할 수 있으며, 회사는 이의가 정당하다고 인정할 경우 즉시 서비스 이용을 재개합니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제17조 손해배상</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 회사 또는 이용자가 본 약관의 규정을 위반하여 상대방에게 손해를 입힌 경우, 그 손해를 배상할 책임이 있습니다.</p>
          <p>2. 이용자가 서비스를 이용함에 있어 행한 불법행위나 본 약관 위반 행위로 인하여 회사가 당해 이용자 이외의 제3자로부터 손해배상 청구 또는 소송을 비롯한 각종 이의제기를 받는 경우, 당해 이용자는 자신의 책임과 비용으로 회사를 면책시켜야 하며, 회사가 면책되지 못한 경우 당해 이용자는 그로 인하여 회사에 발생한 모든 손해를 배상하여야 합니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제18조 회사의 면책</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 회사는 전시, 사변, 천재지변, 국가비상사태, 해결이 곤란한 기술적 결함 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
          <p>2. 회사는 클라우드 서비스 제공사업자(AWS 등)의 장애, 기간통신사업자의 회선 장애 등 회사의 직접적인 통제 범위를 벗어난 사유로 인하여 서비스가 중단되거나 데이터에 손실이 발생한 경우 책임을 지지 않습니다.</p>
          <p>3. 회사는 이용자의 귀책 사유로 인한 서비스 이용의 장애 또는 데이터 유실에 대하여 책임지지 않습니다.</p>
          <p>4. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나 상실한 것에 대하여 책임지지 않으며, 서비스를 통해 제공되는 이용자 간 공유된 정보의 신뢰성, AI 분석 결과의 정확성이나 신뢰성에 대해 고의 또는 중과실이 없는 한 보장하지 않습니다.</p>
          <p>5. 이용자는 임상 사례 공유 시 아동 및 보호자의 개인정보가 노출되지 않도록 할 책임이 있으며, 이를 위반하여 발생하는 모든 법적 분쟁에 대하여 회사는 책임을 지지 않습니다.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold leading-none">제19조 분쟁 해결</h2>
        <div className="flex flex-col gap-3 text-sm font-medium leading-5">
          <p>1. 서비스 이용과 관련하여 회사와 이용자 사이에 분쟁이 발생한 경우, 회사와 이용자는 분쟁의 원만한 해결을 위하여 상호 성실히 협의합니다.</p>
          <p>2. 전항의 협의에도 불구하고 분쟁이 해결되지 않아 소송이 제기될 경우, 양 당사자는 개인정보 분쟁조정위원회 등에 조정을 신청하거나 관련 법령에 따른 관할 법원을 통하여 해결합니다.</p>
        </div>
      </section>

      <div className="flex flex-col text-xs font-medium leading-[18px] text-center">
        <p>공고일: 2026년 05월 04일</p>
        <p>시행일: 2026년 05월 04일</p>
      </div>
    </div>
  );
}
