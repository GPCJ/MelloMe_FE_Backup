import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { toast } from 'sonner'
import {
    SEED_DIAGNOSES,
    DIAGNOSIS_MAX_COUNT,
    DIAGNOSIS_MAX_LENGTH,
} from '@/constants/concern'

interface DiagnosisTagInputProps {
    value: string[]
    onChange: (next: string[]) => void
    disabled?: boolean
}

const MAX_SUGGESTIONS = 8

// 입력 텍스트는 정규화하지 않음 — 임상가가 선호하는 표기('ASD'/'자폐'/'자폐스펙트럼장애' 등)를 그대로 박는다.
// 드롭다운 클릭 시에만 seed name(한글)이 박히며, 그건 사용자가 명시적으로 선택한 결과.
// 트레이드오프: 'ASD' 박은 뒤 드롭다운에서 '자폐스펙트럼장애'를 또 누르면 의미적 중복 발생 — 사용자 책임 영역.

export default function DiagnosisTagInput({
    value,
    onChange,
    disabled = false,
}: DiagnosisTagInputProps) {
    const [input, setInput] = useState('')

    const isFull = value.length >= DIAGNOSIS_MAX_COUNT
    const isDisabled = disabled || isFull

    const q = input.trim().toLowerCase()
    const suggestions =
        q === ''
            ? []
            : SEED_DIAGNOSES.filter(
                  (d) =>
                      d.name.toLowerCase().includes(q) ||
                      d.aliases?.some((a) => a.toLowerCase().includes(q))
              )
                  .filter((d) => !value.includes(d.name))
                  .slice(0, MAX_SUGGESTIONS)

    const addTag = (candidate: string) => {
        const next = candidate.trim()
        if (next === '') return
        if (next.length > DIAGNOSIS_MAX_LENGTH) {
            toast.error(`진단명은 ${DIAGNOSIS_MAX_LENGTH}자 이내로 입력해주세요`)
            return
        }
        if (value.includes(next)) {
            toast.error('이미 추가된 진단명입니다')
            return
        }
        if (value.length >= DIAGNOSIS_MAX_COUNT) {
            toast.error(`진단명은 최대 ${DIAGNOSIS_MAX_COUNT}개까지 추가할 수 있습니다`)
            return
        }
        onChange([...value, next])
        setInput('')
    }

    const removeTag = (target: string) => {
        onChange(value.filter((t) => t !== target))
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault()
            addTag(input)
        }
    }

    return (
        <div className="text-sm">
            {value.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-800"
                        >
                            {tag}
                            <button
                                type="button"
                                aria-label={`${tag} 제거`}
                                onClick={() => removeTag(tag)}
                                disabled={disabled}
                                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    maxLength={DIAGNOSIS_MAX_LENGTH}
                    placeholder={
                        isFull
                            ? '최대 10개까지 추가 가능합니다'
                            : '진단명을 입력하세요'
                    }
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />

                {suggestions.length > 0 && (
                    <div
                        role="listbox"
                        className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
                    >
                        {suggestions.map((d) => (
                            <button
                                key={d.name}
                                type="button"
                                role="option"
                                aria-selected={false}
                                // mousedown 단계에서 input blur를 막아, 향후 blur로 드롭다운을 닫는 개선이 들어와도 click이 유실되지 않도록 한다.
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addTag(d.name)}
                                className="block w-full text-left cursor-pointer px-3 py-2 text-gray-800 hover:bg-gray-50"
                            >
                                {d.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
