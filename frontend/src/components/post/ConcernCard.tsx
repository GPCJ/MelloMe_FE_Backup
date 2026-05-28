import type { AgeGroup, TherapyArea } from '@/types/post';
import { AGE_GROUP_LABELS } from '@/constants/concern';
import { THERAPY_AREA_LABELS } from '@/constants/post';

interface ConcernCardProps {
  ageGroup?: AgeGroup;
  therapyArea?: TherapyArea;
  diagnoses?: string[] | null;
  otherNotes?: string | null;
  body?: string;
  clamp?: boolean;
}

export default function ConcernCard({
  ageGroup,
  therapyArea,
  diagnoses,
  otherNotes,
  body,
  clamp = false,
}: ConcernCardProps) {
  const masked = diagnoses === null;
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-2.5">
      {/* 헤더 */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-100">
        <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-white text-[10px]">
          ?
        </span>
        <span className="text-sm font-bold text-gray-800">고민카드</span>
      </div>

      <div className="px-3 py-2.5">
        {/* 메타: 연령대 / 치료영역 / 진단명 */}
        <dl className="space-y-1.5 text-sm">
          {ageGroup && (
            <div className="flex">
              <dt className="w-16 shrink-0 font-semibold text-gray-600">연령대</dt>
              <dd className="text-gray-700">{AGE_GROUP_LABELS[ageGroup] ?? '-'}</dd>
            </div>
          )}
          {therapyArea && (
            <div className="flex">
              <dt className="w-16 shrink-0 font-semibold text-gray-600">치료영역</dt>
              <dd className="text-gray-700">{THERAPY_AREA_LABELS[therapyArea] ?? '-'}</dd>
            </div>
          )}
          <div className="flex">
            <dt className="w-16 shrink-0 font-semibold text-gray-600">진단명</dt>
            <dd className="flex flex-wrap gap-1">
              {masked ? (
                <span className="text-xs text-gray-400">치료사 인증 후 확인 가능</span>
              ) : (
                (diagnoses ?? []).map((d) => (
                  <span
                    key={d}
                    className="bg-gray-100 text-gray-700 text-xs rounded-full px-2 py-0.5"
                  >
                    {d}
                  </span>
                ))
              )}
            </dd>
          </div>
        </dl>

        {/* 구분선 */}
        <div className="my-2.5 border-t border-gray-100" />

        {/* 고민지점 본문 */}
        <div>
          <span className="text-sm font-bold text-gray-800">고민지점</span>
          <p
            className={`mt-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words ${
              clamp ? 'line-clamp-3' : ''
            }`}
          >
            {body}
          </p>
        </div>

        {/* 기타 (선택, USER에는 null로 내려와 숨김) */}
        {otherNotes && (
          <p className="mt-2 text-xs text-gray-500 whitespace-pre-wrap break-words">
            {otherNotes}
          </p>
        )}
      </div>
    </div>
  );
}
