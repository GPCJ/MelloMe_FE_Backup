import { useRef } from 'react';
import type { TherapyArea } from '../../types/post';
import { FILTER_CHIPS } from '../../constants/post';

interface FilterChipsProps {
  value: TherapyArea | '';
  onChange: (value: TherapyArea | '') => void;
}

export default function FilterChips({ value, onChange }: FilterChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startScroll: 0,
    dragged: false,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;

    dragRef.current.isDown = true;
    dragRef.current.dragged = false;
    dragRef.current.startX = e.pageX;
    dragRef.current.startScroll = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container || !dragRef.current.isDown) return;

    e.preventDefault();
    const walk = e.pageX - dragRef.current.startX;
    if (Math.abs(walk) > 5) {
      dragRef.current.dragged = true;
    }
    container.scrollLeft = dragRef.current.startScroll - walk;
  };

  const stopDragging = () => {
    dragRef.current.isDown = false;
  };

  const handleChipClick = (chipValue: TherapyArea | '') => {
    if (dragRef.current.dragged) return;
    onChange(chipValue);
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
    >
      {FILTER_CHIPS.map((chip) => (
        <button
          type="button"
          key={chip.value}
          onClick={() => handleChipClick(chip.value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value === chip.value
              ? 'bg-gray-900 text-white'
              : 'bg-white text-neutral-950 border border-gray-200'
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
