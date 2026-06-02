import { useMessageComposeStore } from '../../stores/messageComposeStore';
import MessageComposeModal from './MessageComposeModal';

// 쪽지 작성 모달의 조건부 마운트 게이트.
// open만 구독해 열렸을 때만 모달을 마운트하고, 닫히면 언마운트시킨다.
// → 모달 내부 content 등 로컬 state가 자동 청소되어 수동 리셋 effect가 필요 없다.
// state를 들지 않는 얇은 컴포넌트라, Layout이 직접 open을 구독할 때 생기는
// "모달 열 때마다 페이지 전체 리렌더" 비용을 게이트+모달 범위로 좁힌다.
export default function MessageComposeModalGate() {
  const open = useMessageComposeStore((s) => s.open);
  return open ? <MessageComposeModal /> : null;
}
