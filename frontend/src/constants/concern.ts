import type { AgeGroup } from '@/types/post'

export const AGE_GROUP_CHIPS: { value: AgeGroup; label: string }[] = [
    {
        value: 'AGE_0_2',
        label: '영아기'
    },
    {
        value: 'AGE_3_5',
        label: '유아기'
    },
    {
        value: 'AGE_6_12',
        label: '아동기'
    },
    {
        value: 'AGE_13_18',
        label: '청소년기'
    },
    {
        value: 'AGE_19_64',
        label: '성년기'
    },
    {
        value: 'AGE_65_PLUS',
        label: '노령기'
    }
]

export const AGE_GROUP_LABELS: Record<string, string> = {
    'AGE_0_2': '영아기',
    'AGE_3_5': '유아기',
    'AGE_6_12': '아동기',
    'AGE_13_18': '청소년기',
    'AGE_19_64': '성년기',
    'AGE_65_PLUS': '노령기'
}

export const DIAGNOSIS_MAX_COUNT = 10;
export const DIAGNOSIS_MAX_LENGTH = 100; 
export const OTHER_NOTES_MAX_LENGTH = 200;

export interface DiagnosisSeed { 
    name: string;
    aliases?: string[]
}

// PM 제공 22종(2026-05-27). name=저장값(한글), aliases=검색 인덱스(영문·이칭).
export const SEED_DIAGNOSES: DiagnosisSeed[] = [
    { name: '자폐스펙트럼장애', aliases: ['ASD', '오티즘', 'autism', '자폐증', '자폐성장애', '자폐'] },
    { name: '주의력결핍과잉행동장애', aliases: ['ADHD', 'AD'] },
    { name: '학습장애', aliases: ['LD'] },
    { name: '뇌병변장애', aliases: ['CP', '뇌성마비', '뇌병변'] },
    { name: '발달지연', aliases: ['DD'] },
    { name: '언어지연' },
    { name: '언어장애', aliases: ['SLD', 'SD'] },
    { name: '지적장애', aliases: ['ID', 'MR'] },
    { name: '경계선 지능', aliases: ['BIF', '경계선', '느린 학습자'] },
    { name: '틱 장애', aliases: ['tic disorder', '틱'] },
    { name: '뚜렛 증후군', aliases: ['tourette syndrome'] },
    { name: '뇌전증', aliases: ['epilepsy', '간질'] },
    { name: '다운증후군', aliases: ['down syndrome'] },
    { name: '사시', aliases: ['strabismus'] },
    { name: '취약 X 증후군', aliases: ['fragile X syndrome'] },
    { name: '레트 증후군', aliases: ['rett syndrome'] },
    { name: '윌리엄스 증후군', aliases: ['williams syndrome'] },
    { name: '엔젤만 증후군', aliases: ['angelman syndrome'] },
    { name: '선택적 함구증', aliases: ['selective mutism'] },
    { name: '연하장애', aliases: ['dysphagia', '삼킴장애'] },
    { name: '난독증', aliases: ['dyslexia', '난독'] },
    { name: '사회적 의사소통장애', aliases: ['SPCD', '사회성 떨어짐', '사회성 안좋음'] },
]