import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { AgeGroup, TherapyArea, UIVisibility } from '@/types/post'
import { AGE_GROUP_CHIPS } from '@/constants/concern'
import { THERAPY_CHIPS, toApiVisibility } from '@/constants/post'
import { createConcern } from '@/api/concerns'
import { fetchMyPosts } from '@/api/mypage'
import { trackEvent } from '@/lib/analytics'
import { useAuthStore } from '@/stores/useAuthStore'
import DiagnosisTagInput from './DiagnosisTagInput'
import WriteFormHeader from './WriteFormHeader'
import VisibilityPicker from './VisibilityPicker'

const BODY_MAX_LENGTH = 2000

interface ConcernFormProps {
    // 'modal'은 PC 모달 컨테이너 안에서, 'page'는 모바일 단독 페이지에서 사용 (PostWriteForm과 동일 규약).
    variant: 'modal' | 'page'
    onClose: () => void
    // 작성 성공 후 호출. 모달은 보통 close + 피드 invalidate, 페이지는 detail로 navigate.
    onSuccess?: (postId: number) => void
    // 작성 타입 토글 — 컨테이너가 모드를 소유, 폼은 헤더에 토글을 렌더.
    mode: 'post' | 'concern'
    onModeChange: (m: 'post' | 'concern') => void
}

export default function ConcernForm({
    variant,
    onClose,
    onSuccess,
    mode,
    onModeChange,
}: ConcernFormProps) {
    const user = useAuthStore((s) => s.user)
    const isPublicOnly = user?.role === 'USER'

    const [content, setContent] = useState('')
    const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null)
    const [therapyArea, setTherapyArea] = useState<TherapyArea | null>(null)
    const [diagnoses, setDiagnoses] = useState<string[]>([])
    const [visibility, setVisibility] = useState<UIVisibility>('PUBLIC')
    const [requestAutoComment, setRequestAutoComment] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // AI 답변은 전체공개 글에서만 가능 — 비공개(VERIFIED_ONLY/PRIVATE_ONLY는 모두 API PRIVATE로 매핑)면
    // BE가 400으로 막으므로 체크박스를 비활성화하고, 비공개 상태에선 체크값을 무시(false 취급)한다.
    const aiAvailable = toApiVisibility(visibility) === 'PUBLIC'

    // 첫 게시글 여부 (가입→첫글 전환 KPI). 실패 시 조용히 무시 — PostWriteForm과 동일 패턴.
    const [wasFirstPost, setWasFirstPost] = useState(false)
    useEffect(() => {
        fetchMyPosts(0, 1)
            .then((res) => setWasFirstPost(res.totalElements === 0))
            .catch(() => {})
    }, [])

    // 스펙 §4: 고민·연령대·치료영역·진단명(≥1) 모두 FE 필수.
    const canSubmit =
        content.trim().length > 0 &&
        ageGroup !== null &&
        therapyArea !== null &&
        diagnoses.length > 0 &&
        !submitting

    // 사용자가 한 줄이라도 작성했으면 dirty — mode 토글 시 confirm으로 손실 방지.
    const isDirty =
        content.trim().length > 0 ||
        ageGroup !== null ||
        therapyArea !== null ||
        diagnoses.length > 0 ||
        visibility !== 'PUBLIC' ||
        requestAutoComment

    const handleModeChange = (next: 'post' | 'concern') => {
        if (next === mode) return
        if (
            isDirty &&
            !window.confirm('작성 중인 내용이 사라집니다. 전환할까요?')
        ) {
            return
        }
        onModeChange(next)
    }

    async function handleSubmit() {
        if (submitting) return
        if (!canSubmit) {
            const missing: string[] = []
            if (content.trim().length === 0) missing.push('고민지점')
            if (ageGroup === null) missing.push('연령대')
            if (therapyArea === null) missing.push('치료영역')
            if (diagnoses.length === 0) missing.push('진단명')
            if (missing.length > 0) {
                toast.error(`필수 항목을 입력해주세요: ${missing.join(', ')}`)
            }
            return
        }
        // canSubmit이 true면 ageGroup/therapyArea는 null이 아님이 보장됨 — 타입 narrowing용 가드.
        if (ageGroup === null || therapyArea === null) return
        setSubmitting(true)
        setError(null)
        try {
            const post = await createConcern({
                content: content.trim(),
                ageGroup,
                therapyArea,
                diagnoses,
                visibility: toApiVisibility(visibility),
                // 전체공개일 때만 true 전달 — 비공개면 aiAvailable=false라 무조건 꺼진 것으로.
                requestAutoComment: requestAutoComment && aiAvailable,
            })
            trackEvent('post_created', { postType: 'CONCERN_CARD' })
            if (wasFirstPost) trackEvent('first_post_created')
            onSuccess?.(post.id)
        } catch (err) {
            console.error('[concern] createConcern 실패(ConcernForm)', err)
            setError('고민카드 작성에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setSubmitting(false)
        }
    }

    // 컨테이너 패딩: 페이지 variant는 자체 여백 필요, 모달은 모달 카드 안에서 렌더되므로 0.
    // 모달 모드: 부모(PostWriteModal)가 max-h-[90vh] flex-col이므로 flex-1 min-h-0으로 채워
    // 내부 body의 overflow-y-auto가 발동(스크롤)되도록 한다.
    const containerCls =
        variant === 'page'
            ? 'flex flex-col h-[100dvh] bg-white'
            : 'flex flex-col flex-1 min-h-0'

    return (
        <div className={containerCls}>
            <WriteFormHeader
                onClose={onClose}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
                mode={mode}
                onModeChange={handleModeChange}
            />

            {/* 본문 스크롤 영역 — View(ConcernCard)와 동일 순서: 연령대 → 치료영역 → 진단명 → 고민지점 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5 text-sm">
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

                {/* 진단명 — 컨트롤드 자식 컴포넌트 */}
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-gray-800">진단명</span>
                    <DiagnosisTagInput
                        value={diagnoses}
                        onChange={setDiagnoses}
                        disabled={submitting}
                    />
                </div>

                {/* 고민지점 본문 — View 순서에 맞춰 최하단 */}
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

                {/* AI 답변 받기 — 체크 시 작성과 함께 AI 댓글 초안 생성 요청(BE). 전체공개일 때만 활성. */}
                <label
                    className={`flex items-start gap-2.5 rounded-md border p-3 ${
                        aiAvailable
                            ? 'cursor-pointer border-gray-200'
                            : 'cursor-not-allowed border-gray-100 opacity-60'
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={requestAutoComment && aiAvailable}
                        onChange={(e) => setRequestAutoComment(e.target.checked)}
                        disabled={submitting || !aiAvailable}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-gray-900"
                    />
                    <span className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-800">AI 답변 받기</span>
                        <span className="text-xs text-gray-500">
                            {aiAvailable
                                ? '작성하면 AI가 댓글을 달아드려요.'
                                : '전체 공개 글에서만 사용할 수 있어요.'}
                        </span>
                    </span>
                </label>

                {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
            </div>

            {/* 하단 푸터 — 공개범위 + 작성 완료 (고민카드는 첨부 미지원이라 image/file 버튼 없음).
                푸터는 shrink-0라 스크롤과 무관하게 항상 노출 → 모바일에서 다 쓰고 내려온 종점에 완료 버튼 배치.
                aria-disabled 채택: 헤더 버튼과 동일하게 click을 막지 않아 handleSubmit이 누락 필드 토스트를 띄울 수 있게. */}
            <footer className="border-t border-gray-100 px-4 py-2.5 flex items-center shrink-0">
                <VisibilityPicker
                    visibility={visibility}
                    onChange={setVisibility}
                    isPublicOnly={isPublicOnly}
                    align="left"
                />
                <div className="flex-1" />
                <button
                    type="button"
                    onClick={handleSubmit}
                    aria-disabled={!canSubmit}
                    className="rounded-md border border-gray-900 bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-black aria-disabled:border-gray-200 aria-disabled:bg-white aria-disabled:text-gray-300 aria-disabled:hover:bg-white aria-disabled:cursor-not-allowed"
                >
                    작성 완료
                </button>
            </footer>
        </div>
    )
}
