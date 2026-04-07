import type { TherapyArea } from '../../types/post';
import { FILTER_CHIPS } from '../../constants/post';

interface FilterChipsProps {
  value: TherapyArea | '';
  onChange: (value: TherapyArea | '') => void;
}

export default function FilterChips({ value, onChange }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {FILTER_CHIPS.map((chip) => (
        <button
          type="button"
          key={chip.value}
          onClick={() => onChange(chip.value)}
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
