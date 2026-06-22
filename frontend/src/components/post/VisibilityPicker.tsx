import { useEffect, useRef, useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import type { UIVisibility } from '../../types/post';
import { VISIBILITY_OPTIONS } from '../../constants/post';

interface VisibilityPickerProps {
  visibility: UIVisibility;
  onChange: (v: UIVisibility) => void;
  isPublicOnly: boolean;
  // 팝오버가 자라는 방향 — picker가 푸터 왼쪽 끝에 있으면(고민카드 작성) 'left'로 줘서
  // 오른쪽으로 펼치게 한다. 기본 'right'는 picker가 오른쪽에 있을 때(작성/수정 폼) 안쪽으로 펼침.
  align?: 'left' | 'right';
}

// 공개 범위 chip + popover — PostWriteForm 푸터와 동일 시각/동작 규약.
// 자체 open/ref 보유 → 호출자가 외부 클릭 가드를 신경 쓸 필요 없음.
export default function VisibilityPicker({
  visibility,
  onChange,
  isPublicOnly,
  align = 'right',
}: VisibilityPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // capture phase + stopPropagation으로 모달 backdrop의 onMouseDown close가 함께 트리거되지 않게 함.
        // (popover만 닫히고 모달은 유지) — PostWriteForm/ConcernForm modal variant 양쪽에 일관 적용.
        e.stopPropagation();
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick, true);
    return () => document.removeEventListener('mousedown', onDocClick, true);
  }, [open]);

  const current = isPublicOnly
    ? VISIBILITY_OPTIONS[0]
    : (VISIBILITY_OPTIONS.find((o) => o.value === visibility) ?? VISIBILITY_OPTIONS[0]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !isPublicOnly && setOpen((v) => !v)}
        disabled={isPublicOnly}
        aria-haspopup="menu"
        aria-expanded={open}
        title={isPublicOnly ? '치료사 인증 후 공개 범위 설정 가능' : undefined}
        className={`flex items-center gap-1.5 text-xs ${
          isPublicOnly
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-gray-900 cursor-pointer'
        }`}
      >
        <span>{current.chipLabel}</span>
        {current.value === 'PUBLIC' ? <LockOpen size={14} /> : <Lock size={14} />}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute bottom-full mb-2 w-64 bg-white rounded-xl shadow-[0px_4px_10px_0px_rgba(136,136,136,0.20)] border border-gray-100 py-2 z-10 ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {VISIBILITY_OPTIONS.map((opt) => {
            const selected = visibility === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-900">{opt.label}</span>
                {/* 토글 — 시안 1367:6227: 흰 배경 pill + 검은 점이 좌/우 이동. */}
                <span className="relative inline-flex w-9 h-5 rounded-full bg-white border border-gray-200">
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-gray-900 transition-transform ${
                      selected ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
