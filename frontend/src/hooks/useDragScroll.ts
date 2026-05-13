import { useRef } from 'react';

// 가로 드래그 스크롤 — 첨부 이미지 캐러셀 / 칩 미리보기 등에서 공용.
// 반환값:
//   - ref: 스크롤 컨테이너 div에 부착
//   - handlers: 같은 div에 spread (onMouseDown/Move/Up/Leave)
//   - state: 드래그 누적 거리(moved) 등 — Link 안 클릭 흡수 가드용
//     예) onClickCapture에서 state.current.moved > 5면 e.preventDefault + stopPropagation
//
// 동작:
//   mousedown에서 시작점(scrollLeft + pageX) 캡쳐 → mousemove에서 그 차이만큼 scrollLeft 갱신.
//   터치 스크롤은 overflow-x-auto의 네이티브 처리에 위임 (touch 핸들러 별도 X).
export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const handlers = {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      state.current = { active: true, startX: e.pageX, startScroll: el.scrollLeft, moved: 0 };
      el.style.cursor = 'grabbing';
    },
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || !state.current.active) return;
      const dx = e.pageX - state.current.startX;
      el.scrollLeft = state.current.startScroll - dx;
      state.current.moved = Math.abs(dx);
    },
    onMouseUp: () => {
      if (ref.current) ref.current.style.cursor = '';
      state.current.active = false;
    },
    onMouseLeave: () => {
      if (ref.current) ref.current.style.cursor = '';
      state.current.active = false;
    },
  };
  return { ref, state, handlers };
}
