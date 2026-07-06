import { useState } from 'react';
import { toast } from 'sonner';
import type {
  EmploymentType,
  JobRegion,
  JobPostCreatePayload,
} from '../../types/jobPost';
import type { TherapyArea } from '../../types/post';
import {
  EMPLOYMENT_TYPE_LABELS,
  REGION_LABELS,
  ALWAYS_OPEN_DEADLINE,
} from '../../constants/jobPost';
import { THERAPY_CHIPS } from '../../constants/post';
import { isHttpUrl, type JobPostFormValues } from '../../utils/jobPost';

const NAME_MAX = 100;
const CONTENT_MAX = 2000;

const EMPTY_VALUES: JobPostFormValues = {
  organizationName: '',
  therapyArea: null,
  region: '',
  employmentType: null,
  alwaysRecruiting: false,
  deadlineDate: '',
  content: '',
  qualification: '',
  preferred: '',
  salaryText: '',
  sourceUrl: '',
};

interface JobPostFormProps {
  // 미지정=작성(빈 폼), 지정=수정(prefill).
  initialValues?: JobPostFormValues;
  submitLabel?: string;
  // 검증 통과 후 정규화된 payload로 호출 — 컨테이너가 생성/수정 mutation + navigate 담당.
  // 실패 시 throw하면 폼이 잡아 에러 문구를 노출(제출 상태 해제).
  onSubmit: (payload: JobPostCreatePayload) => Promise<void>;
}

// Phase 2 구인공고 작성/수정 공용 폼. ConcernForm의 plain-useState 패턴(폼 라이브러리 미사용).
// 페이지 chrome(헤더/래퍼)은 상위 페이지가 소유, 이 컴포넌트는 필드 + 검증 + 제출 위임만 담당.
export default function JobPostForm({
  initialValues,
  submitLabel = '공고 등록',
  onSubmit,
}: JobPostFormProps) {
  const init = initialValues ?? EMPTY_VALUES;
  const [organizationName, setOrganizationName] = useState(init.organizationName);
  const [therapyArea, setTherapyArea] = useState<TherapyArea | null>(init.therapyArea);
  const [region, setRegion] = useState<JobRegion | ''>(init.region);
  const [employmentType, setEmploymentType] = useState<EmploymentType | null>(
    init.employmentType,
  );
  const [alwaysRecruiting, setAlwaysRecruiting] = useState(init.alwaysRecruiting);
  const [deadlineDate, setDeadlineDate] = useState(init.deadlineDate);
  const [content, setContent] = useState(init.content);
  const [qualification, setQualification] = useState(init.qualification);
  const [preferred, setPreferred] = useState(init.preferred);
  const [salaryText, setSalaryText] = useState(init.salaryText);
  const [sourceUrl, setSourceUrl] = useState(init.sourceUrl);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 마감일은 상시모집이 아닐 때만 필수. sourceUrl은 BE 계약상 필수.
  const canSubmit =
    organizationName.trim().length > 0 &&
    therapyArea !== null &&
    region !== '' &&
    employmentType !== null &&
    content.trim().length > 0 &&
    sourceUrl.trim().length > 0 &&
    (alwaysRecruiting || deadlineDate !== '') &&
    !submitting;

  async function handleSubmit() {
    if (submitting) return;
    if (!canSubmit) {
      const missing: string[] = [];
      if (!organizationName.trim()) missing.push('기관명');
      if (therapyArea === null) missing.push('치료영역');
      if (region === '') missing.push('지역');
      if (employmentType === null) missing.push('고용형태');
      if (!alwaysRecruiting && deadlineDate === '') missing.push('마감일');
      if (!content.trim()) missing.push('상세 내용');
      if (!sourceUrl.trim()) missing.push('원문 링크');
      if (missing.length > 0) toast.error(`필수 항목을 입력해주세요: ${missing.join(', ')}`);
      return;
    }
    // sourceUrl 스킴 검증 — 폼에 <form>이 없어 type="url" 네이티브 검증이 안 도므로 직접 확인.
    // http(s) 아닌 값(스킴 누락·javascript: 등)은 상세 링크에서 오작동/오염되므로 차단.
    if (!isHttpUrl(sourceUrl.trim())) {
      toast.error('원문 링크는 http:// 또는 https:// 로 시작하는 주소여야 해요.');
      return;
    }
    // 여기 도달 시 canSubmit === true. TS가 canSubmit 정의를 따라 therapyArea/region/
    // employmentType을 이미 non-null/non-empty로 narrowing하므로 추가 가드 불필요.
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        organizationName: organizationName.trim(),
        content: content.trim(),
        therapyArea,
        employmentType,
        region,
        sourceUrl: sourceUrl.trim(),
        // 상시모집이면 sentinel 날짜를 실어 보냄(BE 합의). 아니면 사용자가 고른 마감일.
        deadlineDate: alwaysRecruiting ? ALWAYS_OPEN_DEADLINE : deadlineDate,
        alwaysRecruiting,
        salaryText: salaryText.trim() || undefined,
        qualification: qualification.trim() || undefined,
        preferred: preferred.trim() || undefined,
      });
      // 성공 후 네비게이션/캐시 무효화는 컨테이너(onSubmit) 책임 — 폼은 여기서 끝.
    } catch (err) {
      console.error('[jobpost] 공고 저장 실패(JobPostForm)', err);
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 pb-24 pt-2 flex flex-col gap-5 text-sm">
      {/* 제목 입력칸 없음 — 공고 제목은 BE가 조직명·분야 등으로 서버에서 파생(staging 계약). */}

      {/* 기관명 */}
      <Field label="기관·병원명" required>
        <input
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          disabled={submitting}
          maxLength={NAME_MAX}
          placeholder="예: 햇살아동발달센터"
          className={inputCls}
        />
      </Field>

      {/* 치료영역 — 칩 (UNSPECIFIED '전체' 제외) */}
      <Field label="치료영역" required>
        <div className="flex flex-wrap gap-2">
          {THERAPY_CHIPS.filter((c) => c.value !== 'UNSPECIFIED').map((chip) => (
            <ChipButton
              key={chip.value}
              active={therapyArea === chip.value}
              disabled={submitting}
              onClick={() => setTherapyArea(chip.value)}
            >
              {chip.label}
            </ChipButton>
          ))}
        </div>
      </Field>

      {/* 지역 — select */}
      <Field label="지역" required>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as JobRegion | '')}
          disabled={submitting}
          className={inputCls}
        >
          <option value="">지역 선택</option>
          {(Object.keys(REGION_LABELS) as JobRegion[]).map((r) => (
            <option key={r} value={r}>
              {REGION_LABELS[r]}
            </option>
          ))}
        </select>
      </Field>

      {/* 고용형태 — 칩 */}
      <Field label="고용형태" required>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EMPLOYMENT_TYPE_LABELS) as EmploymentType[]).map((t) => (
            <ChipButton
              key={t}
              active={employmentType === t}
              disabled={submitting}
              onClick={() => setEmploymentType(t)}
            >
              {EMPLOYMENT_TYPE_LABELS[t]}
            </ChipButton>
          ))}
        </div>
      </Field>

      {/* 마감일 + 상시모집 */}
      <Field label="마감일" required>
        <input
          type="date"
          value={deadlineDate}
          onChange={(e) => setDeadlineDate(e.target.value)}
          disabled={submitting || alwaysRecruiting}
          className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`}
        />
        <label className="mt-2 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={alwaysRecruiting}
            onChange={(e) => setAlwaysRecruiting(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 shrink-0 accent-gray-900"
          />
          <span className="text-gray-700">상시모집 (마감일 없음)</span>
        </label>
      </Field>

      {/* 상세 내용 */}
      <Field label="상세 내용" required>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
          maxLength={CONTENT_MAX}
          rows={8}
          placeholder="근무 조건, 담당 업무, 지원 방법 등을 자유롭게 작성해주세요."
          className={`${inputCls} resize-none`}
        />
        <p className="text-right text-xs text-gray-400">
          {content.length} / {CONTENT_MAX}
        </p>
      </Field>

      {/* 선택 항목 */}
      <Field label="자격요건">
        <textarea
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          disabled={submitting}
          rows={3}
          placeholder="예: 언어재활사 2급 이상 자격 소지자 (선택)"
          className={`${inputCls} resize-none`}
        />
      </Field>

      <Field label="우대사항">
        <textarea
          value={preferred}
          onChange={(e) => setPreferred(e.target.value)}
          disabled={submitting}
          rows={3}
          placeholder="예: 아동 치료 경력 1년 이상 (선택)"
          className={`${inputCls} resize-none`}
        />
      </Field>

      <Field label="급여">
        <input
          value={salaryText}
          onChange={(e) => setSalaryText(e.target.value)}
          disabled={submitting}
          placeholder="예: 면접 후 협의 / 월 320만원~ (선택)"
          className={inputCls}
        />
      </Field>

      <Field label="원문 링크" required>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          disabled={submitting}
          maxLength={500}
          placeholder="https:// — 상세의 '원문에서 지원하기' 링크"
          className={inputCls}
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      {/* 제출 버튼 — 페이지가 Layout(모바일 BottomNav) 안이라 fixed 대신 흐름 배치로 겹침 회피. */}
      <button
        type="button"
        onClick={handleSubmit}
        aria-disabled={!canSubmit}
        className="mt-2 w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-black aria-disabled:bg-gray-200 aria-disabled:text-gray-400 aria-disabled:hover:bg-gray-200 aria-disabled:cursor-not-allowed"
      >
        {submitting ? '저장 중…' : submitLabel}
      </button>
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none disabled:bg-gray-50';

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-semibold text-gray-800">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </div>
  );
}

function ChipButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        active
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
      }`}
    >
      {children}
    </button>
  );
}
