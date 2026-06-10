import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// 이미지 확대 라이트박스 — 게시글 상세 첨부 이미지 클릭 시 풀스크린 오버레이.
// LegalModal과 동일한 portal/ESC/배경잠금 컨벤션을 따른다.
//   - 직접 오버레이(라이브러리 X). 다중 이미지 좌우 네비게이션 + ESC/배경 클릭 닫기.
//   - 줌(Phase 2): Pointer 이벤트로 터치/마우스 통합.
//       · 핀치(2포인터) 확대/축소 / 확대 중 1포인터 드래그로 팬(이동)
//       · 더블탭(모바일)·더블클릭(PC)으로 1↔2배 토글 / PC 휠 줌
//   - 확대 중에는 좌우 네비게이션 버튼을 숨겨 팬 제스처와 충돌을 피한다.

interface LightboxImage {
  url: string;
  alt?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  onClose: () => void;
}

const MAX_SCALE = 4;
const DOUBLE_TAP_MS = 300; // 더블탭 인정 간격

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const count = images.length;

  const imgRef = useRef<HTMLImageElement>(null);
  // 활성 포인터 추적 — 멀티터치 핀치 거리 계산용(pointerId → 좌표).
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef({ active: false, startDist: 0, startScale: 1 });
  const pan = useRef({ active: false, startX: 0, startY: 0, startOx: 0, startOy: 0, moved: false });
  const pinched = useRef(false); // 이번 제스처에 핀치가 있었는지(핀치 종료를 탭으로 오인 방지)
  const lastTap = useRef(0);

  const resetZoom = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // 좌우 순환(wrap-around) + 전환 시 줌 초기화.
  const goPrev = useCallback(() => {
    resetZoom();
    setCurrent((i) => (i - 1 + count) % count);
  }, [count, resetZoom]);
  const goNext = useCallback(() => {
    resetZoom();
    setCurrent((i) => (i + 1) % count);
  }, [count, resetZoom]);

  // 키보드: ESC 닫기 / ← → 이미지 전환.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goPrev, goNext]);

  // 오버레이가 떠 있는 동안 배경 스크롤 잠금.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // 현재 배율 기준으로 이미지가 화면 밖으로 완전히 빠지지 않게 offset 제한.
  // getBoundingClientRect는 transform 적용 크기라 scale로 나눠 원본 크기를 역산한다.
  const clamp = useCallback((off: { x: number; y: number }, s: number) => {
    const el = imgRef.current;
    if (!el || s <= 1) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const maxX = (rect.width - rect.width / s) / 2;
    const maxY = (rect.height - rect.height / s) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, off.x)),
      y: Math.max(-maxY, Math.min(maxY, off.y)),
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { active: true, startDist: distance(a, b), startScale: scale };
      pinched.current = true;
      pan.current.active = false;
    } else if (pointers.current.size === 1) {
      pan.current = {
        active: scale > 1, // 확대 상태에서만 팬
        startX: e.clientX,
        startY: e.clientY,
        startOx: offset.x,
        startOy: offset.y,
        moved: false,
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch.current.active && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const ratio = distance(a, b) / (pinch.current.startDist || 1);
      const next = Math.max(1, Math.min(MAX_SCALE, pinch.current.startScale * ratio));
      setScale(next);
      setOffset((o) => clamp(o, next));
      return;
    }
    if (pan.current.active && pointers.current.size === 1) {
      const dx = e.clientX - pan.current.startX;
      const dy = e.clientY - pan.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) pan.current.moved = true;
      setOffset(clamp({ x: pan.current.startOx + dx, y: pan.current.startOy + dy }, scale));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // 핀치 없이 1포인터를 움직이지 않고 뗀 경우만 '탭'으로 인정.
    const wasTap = pointers.current.size === 1 && !pan.current.moved && !pinched.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current.active = false;

    if (pointers.current.size === 0) {
      pan.current.active = false;
      pinched.current = false;
      // 핀치 결과가 1배 근처면 깔끔히 정렬.
      if (scale > 1 && scale <= 1.05) resetZoom();
      // 더블탭 토글.
      if (wasTap) {
        const now = Date.now();
        if (now - lastTap.current < DOUBLE_TAP_MS) {
          lastTap.current = 0;
          if (scale > 1) resetZoom();
          else setScale(2);
        } else {
          lastTap.current = now;
        }
      }
    }
  };

  // PC 휠 줌.
  const onWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const next = Math.max(1, Math.min(MAX_SCALE, scale - e.deltaY * 0.0015));
    setScale(next);
    setOffset((o) => clamp(o, next));
  };

  // PC 더블클릭 토글.
  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) resetZoom();
    else setScale(2);
  };

  const image = images[current];
  if (!image) return null;
  const zoomed = scale > 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="이미지 확대 보기"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      {/* 닫기 버튼 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-4 top-4 z-10 p-1 text-white/90 hover:text-white"
      >
        <X size={28} />
      </button>

      {/* 이미지 카운터 (다중일 때만) */}
      {count > 1 && (
        <span className="absolute left-1/2 top-5 -translate-x-1/2 text-sm text-white/80">
          {current + 1} / {count}
        </span>
      )}

      {/* 이전 — 확대 중에는 팬 우선이라 숨김 */}
      {count > 1 && !zoomed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // 배경 닫기로 버블링 방지
            goPrev();
          }}
          aria-label="이전 이미지"
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white sm:left-4"
        >
          <ChevronLeft size={36} />
        </button>
      )}

      {/* 이미지 본체 — 클릭은 배경 닫기로 버블링하지 않게 차단.
          touchAction: 'none'으로 브라우저 기본 제스처(페이지 줌/스크롤)를 끄고 직접 처리. */}
      <img
        ref={imgRef}
        crossOrigin="anonymous"
        src={image.url}
        alt={image.alt ?? ''}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={onDoubleClick}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          touchAction: 'none',
          cursor: zoomed ? 'grab' : 'zoom-in',
        }}
        className="max-h-[90vh] max-w-[90vw] select-none object-contain"
      />

      {/* 다음 — 확대 중에는 팬 우선이라 숨김 */}
      {count > 1 && !zoomed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="다음 이미지"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white sm:right-4"
        >
          <ChevronRight size={36} />
        </button>
      )}
    </div>,
    document.body,
  );
}
