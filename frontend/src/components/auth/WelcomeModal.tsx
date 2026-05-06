interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: () => void;
}

export default function WelcomeModal({ open, onClose, onVerify }: WelcomeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="w-full max-w-[500px] bg-white rounded-3xl shadow-[0px_4px_10px_0px_rgba(136,136,136,0.20)] inline-flex flex-col items-start gap-5"
      >
        <header className="self-stretch px-6 pt-6 flex flex-col justify-end items-center gap-2.5">
          <h2
            id="welcome-title"
            className="text-center text-neutral-950 text-2xl font-bold font-['Pretendard'] leading-6"
          >
            환영합니다!
          </h2>
        </header>
        <div className="self-stretch flex flex-col items-center gap-3.5">
          <p className="self-stretch text-center text-gray-600 text-base font-normal font-['Pretendard'] leading-6">
            멜티는 치료사들을 위한
            <br />
            믿을 수 있는 커뮤니티 입니다.
            <br />
            치료사 인증 완료 후에 더 전문적인
            <br />
            서비스 이용이 가능합니다.
          </p>
        </div>
        {/* 버튼 영역 */}
        <div className="self-stretch px-6 pb-6 flex flex-col justify-center items-center gap-2.5">
          <button
            type="button"
            onClick={onVerify}
            className="self-stretch h-10 px-4 py-2 bg-black rounded-[999px] inline-flex justify-center items-center gap-2 text-center text-white text-sm font-medium font-['Pretendard'] leading-4"
          >
            치료사 인증하기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="self-stretch h-10 px-4 py-2 bg-white rounded-[999px] outline outline-1 outline-offset-[-1px] outline-black inline-flex justify-center items-center gap-2 text-center text-neutral-950 text-sm font-medium font-['Pretendard'] leading-4"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
