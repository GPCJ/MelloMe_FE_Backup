import { useMemo, useState } from 'react'
import { ArrowLeft, PencilLine } from 'lucide-react'
import { toast } from 'sonner'
import type { AgeGroup, TherapyArea, UIVisibility, Visibility } from '@/types/post'
import { AGE_GROUP_CHIPS } from '@/constants/concern'
import { THERAPY_CHIPS, fromApiVisibility, toApiVisibility } from '@/constants/post'
import { updatePost } from '@/api/posts'
import { useAuthStore } from '@/stores/useAuthStore'
import DiagnosisTagInput from './DiagnosisTagInput'
import VisibilityPicker from './VisibilityPicker'

const BODY_MAX_LENGTH = 2000

// 수정 진입 시 백엔드에서 받은 기존 값. visibility는 UI 노출 없이 그대로 PATCH 동봉.
export interface ConcernInitialValues {
    content: string
    ageGroup: AgeGroup
    therapyArea: TherapyArea
    diagnoses: string[]
    otherNotes: string
    visibility: Visibility
}

interface ConcernEditFormProps {
    postId: number
    initial: ConcernInitialValues
    onClose: () => void
    onSuccess?: (postId: number) => void
}

// diagnoses 배열 비교 — 길이·순서·내용 모두 동일해야 not-dirty.
function arrayEquals(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
    }
    return true
}

export default function ConcernEditForm({
    postId,
    initial,
    onClose,
    onSuccess,
}: ConcernEditFormProps) {
    const user = useAuthStore((s) => s.user)
    const isPublicOnly = user?.role === 'USER'

    const initialUIVisibility = useMemo(
        () => fromApiVisibility(initial.visibility),
        [initial.visibility]
    )

    const [content, setContent] = useState(initial.content)
    const [ageGroup, setAgeGroup] = useState<AgeGroup>(initial.ageGroup)
    const [therapyArea, setTherapyArea] = useState<TherapyArea>(initial.therapyArea)
    const [diagnoses, setDiagnoses] = useState<string[]>(initial.diagnoses)
    const [visibility, setVisibility] = useState<UIVisibility>(initialUIVisibility)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 수정 시 필수 — UNSPECIFIED 허용 X(create와 동일 정책). 백엔드에서 UNSPECIFIED 내려와도 사용자가 변경하도록 강제.
    const isValid =
        content.trim().length > 0 &&
        ageGroup !== 'UNSPECIFIED' &&
        therapyArea !== 'UNSPECIFIED' &&
        diagnoses.length > 0

    const isDirty =
        content !== initial.content ||
        ageGroup !== initial.ageGroup ||
        therapyArea !== initial.therapyArea ||
        !arrayEquals(diagnoses, initial.diagnoses) ||
        visibility !== initialUIVisibility

    const canSubmit = isValid && isDirty && !submitting

    async function handleSubmit() {
        if (submitting) return
        if (!isValid) {
            const missing: string[] = []
            if (content.trim().length === 0) missing.push('고민지점')
            if (ageGroup === 'UNSPECIFIED') missing.push('연령대')
            if (therapyArea === 'UNSPECIFIED') missing.push('치료영역')
            if (diagnoses.length === 0) missing.push('진단명')
            if (missing.length > 0) {
                toast.error(`필수 항목을 입력해주세요: ${missing.join(', ')}`)
            }
            return
        }
        if (!isDirty) return
        setSubmitting(true)
        setError(null)
        try {
            await updatePost(postId, {
                content: content.trim(),
                ageGroup,
                therapyArea,
                diagnoses,
                // 기타(otherNotes): 2차 UT 반영으로 편집 UI 제거(작성폼과 대칭). 기존 데이터는
                // 보존해야 하므로 initial 값을 그대로 pass-through(생략 시 BE에서 소실 위험 회피).
                otherNotes: initial.otherNotes.trim() || undefined,
                visibility: toApiVisibility(visibility),
            })
            // 수정 analytics는 기존 PostEditPage와 일관해서 미발사 — PM 합의 후 추가 검토.
            onSuccess?.(postId)
        } catch (err) {
            console.error('[concern] updatePost 실패(ConcernEditForm)', err)
            setError('고민카드 수정에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        // 모바일: 풀스크린(h-[100dvh] + 내부 스크롤). PC(md+): PostDetailPage와 동일 max-w-3xl 중앙 정렬 + 자연 흐름.
        <div className="flex flex-col h-[100dvh] bg-white pb-20 md:h-auto md:max-w-3xl md:mx-auto md:pb-8">
            {/* 헤더: ← 고민카드 수정 ✏️(submit) — 수정 화면은 mode 토글 없음(postType 불변). */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="닫기"
                    className="p-1 -ml-1 text-gray-700 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-base font-semibold text-gray-900">
                    고민카드 수정
                </h1>
                <button
                    type="button"
                    onClick={handleSubmit}
                    aria-disabled={!canSubmit}
                    aria-label="수정하기"
                    className="p-1 -mr-1 text-gray-900 hover:text-black transition-colors aria-disabled:text-gray-300 aria-disabled:cursor-not-allowed"
                >
                    <PencilLine size={20} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5 text-sm">
                {/* 고민지점 */}
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800">고민지점</span>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={submitting}
                        maxLength={BODY_MAX_LENGTH}
                        rows={8}
                        placeholder="고민하는 지점을 자유롭게 작성해보세요."
                        className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <p className="text-right text-xs text-gray-400">
                        {content.length} / {BODY_MAX_LENGTH}
                    </p>
                </div>

                {/* 연령대 */}
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-gray-800">연령대</span>
                    <div className="flex flex-wrap gap-2">
                        {AGE_GROUP_CHIPS.map((chip) => {
                            const active = ageGroup === chip.value
                            return (
                                <button
                                    key={chip.value}
                                    type="button"
                                    onClick={() => setAgeGroup(chip.value)}
                                    disabled={submitting}
                                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                                        active
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    {chip.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 치료영역 — UNSPECIFIED('전체') 제외 */}
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-gray-800">치료영역</span>
                    <div className="flex flex-wrap gap-2">
                        {THERAPY_CHIPS.filter(
                            (c) => c.value !== 'UNSPECIFIED'
                        ).map((chip) => {
                            const active = therapyArea === chip.value
                            return (
                                <button
                                    key={chip.value}
                                    type="button"
                                    onClick={() => setTherapyArea(chip.value)}
                                    disabled={submitting}
                                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                                        active
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    {chip.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 진단명 */}
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-gray-800">진단명</span>
                    <DiagnosisTagInput
                        value={diagnoses}
                        onChange={setDiagnoses}
                        disabled={submitting}
                    />
                </div>

                {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            </div>

            {/* 하단 푸터 — 공개범위만 (고민카드는 첨부 미지원이라 image/file 버튼 없음). */}
            <footer className="border-t border-gray-100 px-4 py-2.5 flex items-center shrink-0">
                <div className="flex-1" />
                <VisibilityPicker
                    visibility={visibility}
                    onChange={setVisibility}
                    isPublicOnly={isPublicOnly}
                />
            </footer>
        </div>
    )
}
