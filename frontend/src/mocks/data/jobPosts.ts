import type { JobPostDetail } from '../../types/jobPost';
import { REGION_LABELS, EMPLOYMENT_TYPE_LABELS } from '../../constants/jobPost';
import { THERAPY_AREA_LABELS } from '../../constants/post';

// 더미 구인공고 — staging 실데이터 0건이라 개발/표시 검증용.
// AI 큐레이션 형태(sourceUrl 필수, 외부 원문) 모사. id 내림차순(최신순) 유지 → cursor 페이지네이션용.
type Seed = Pick<
  JobPostDetail,
  | 'id'
  | 'title'
  | 'organizationName'
  | 'therapyArea'
  | 'region'
  | 'employmentType'
  | 'status'
  | 'dday'
  | 'deadlineDate'
  | 'content'
  | 'sourceUrl'
> &
  Partial<Pick<JobPostDetail, 'qualification' | 'preferred' | 'salaryText'>>;

const seeds: Seed[] = [
  {
    id: 12,
    title: '언어재활사 정규직 모집',
    organizationName: '햇살아동발달센터',
    therapyArea: 'SPEECH',
    region: 'SEOUL',
    employmentType: 'FULL_TIME',
    status: 'OPEN',
    dday: 12,
    deadlineDate: '2026-07-06',
    salaryText: '면접 후 협의 (경력 우대)',
    content:
      '서울 강남권 아동발달센터에서 언어재활사를 모집합니다.\n\n- 근무: 주 5일 (월~금)\n- 대상: 만 3~12세 발달지연 아동\n- 평가 및 개별 치료 세션 진행',
    qualification: '언어재활사 2급 이상 자격 소지자',
    preferred: '아동 언어치료 경력 1년 이상, 보호자 상담 경험',
    sourceUrl: 'https://example.com/jobs/12',
  },
  {
    id: 11,
    title: '감각통합 작업치료사 (계약직)',
    organizationName: '키움소아청소년발달의원',
    therapyArea: 'SENSORY_INTEGRATION',
    region: 'GYEONGGI',
    employmentType: 'CONTRACT',
    status: 'OPEN',
    dday: 5,
    deadlineDate: '2026-06-29',
    salaryText: '월 320만원~',
    content:
      '경기 분당 소재 의원에서 감각통합 치료를 담당할 작업치료사를 채용합니다.\n\n감각통합 장비 완비, 신규 선생님 교육 지원.',
    qualification: '작업치료사 면허 소지자',
    sourceUrl: 'https://example.com/jobs/11',
  },
  {
    id: 10,
    title: '놀이치료 선생님 파트타임',
    organizationName: '마음숲심리상담센터',
    therapyArea: 'PLAY',
    region: 'INCHEON',
    employmentType: 'PART_TIME',
    status: 'OPEN',
    dday: 0,
    deadlineDate: '2026-06-24',
    content:
      '오후 시간대(14시~19시) 놀이치료 세션을 진행하실 선생님을 찾습니다.\n주 3회 근무 가능자 우대.',
    preferred: '놀이치료 수련 과정 이수자',
    sourceUrl: 'https://example.com/jobs/10',
  },
  {
    id: 9,
    title: '인지학습 치료사 모집 (프리랜서)',
    organizationName: '브레인업학습클리닉',
    therapyArea: 'COGNITIVE',
    region: 'BUSAN',
    employmentType: 'FREELANCE',
    status: 'OPEN',
    dday: 20,
    deadlineDate: '2026-07-14',
    salaryText: '세션당 4~6만원',
    content: '부산 해운대 학습클리닉에서 인지·학습 치료 프리랜서 선생님을 모십니다.',
    sourceUrl: 'https://example.com/jobs/9',
  },
  {
    id: 8,
    title: '미술치료사 정규직 (신규 오픈)',
    organizationName: '컬러풀아동심리연구소',
    therapyArea: 'ART',
    region: 'DAEGU',
    employmentType: 'FULL_TIME',
    status: 'OPEN',
    dday: 8,
    deadlineDate: '2026-07-02',
    salaryText: '연 3,200만원~',
    content: '대구 신규 오픈 센터에서 미술치료사를 모십니다. 초기 멤버 합류 기회.',
    qualification: '미술치료사 자격 소지자',
    preferred: '집단 미술치료 경험',
    sourceUrl: 'https://example.com/jobs/8',
  },
  {
    id: 7,
    title: '음악치료사 채용',
    organizationName: '하모니발달센터',
    therapyArea: 'MUSIC',
    region: 'DAEJEON',
    employmentType: 'CONTRACT',
    status: 'OPEN',
    dday: 15,
    deadlineDate: '2026-07-09',
    content: '대전 음악치료사 채용 공고입니다. 악기 및 음향 장비 지원.',
    sourceUrl: 'https://example.com/jobs/7',
  },
  {
    id: 6,
    title: '행동치료(ABA) 치료사 모집',
    organizationName: 'ABA행동발달연구소',
    therapyArea: 'BEHAVIOR',
    region: 'SEOUL',
    employmentType: 'FULL_TIME',
    status: 'OPEN',
    dday: 3,
    deadlineDate: '2026-06-27',
    salaryText: '면접 후 협의',
    content: '자폐스펙트럼 아동 대상 ABA 프로그램을 운영할 치료사를 모집합니다.',
    qualification: '관련 학과 졸업 또는 ABA 수련 경험자',
    sourceUrl: 'https://example.com/jobs/6',
  },
  {
    id: 5,
    title: '물리치료사 (소아 재활)',
    organizationName: '튼튼재활의학과의원',
    therapyArea: 'PHYSICAL',
    region: 'GWANGJU',
    employmentType: 'FULL_TIME',
    status: 'OPEN',
    dday: 30,
    deadlineDate: '2026-07-24',
    salaryText: '월 350만원~',
    content: '광주 소재 재활의학과에서 소아 재활 물리치료사를 채용합니다.',
    qualification: '물리치료사 면허 소지자',
    sourceUrl: 'https://example.com/jobs/5',
  },
  {
    id: 4,
    title: '언어치료사 (재택 평가 지원)',
    organizationName: '온라인발달케어',
    therapyArea: 'SPEECH',
    region: 'REMOTE',
    employmentType: 'FREELANCE',
    status: 'OPEN',
    dday: 18,
    deadlineDate: '2026-07-12',
    content: '비대면 발달 평가 리포트 작성을 지원할 언어치료사를 모십니다. 재택 근무.',
    preferred: '평가 보고서 작성 경험',
    sourceUrl: 'https://example.com/jobs/4',
  },
  {
    id: 3,
    title: '작업치료사 인턴 (전국 채용)',
    organizationName: '한국아동발달네트워크',
    therapyArea: 'OCCUPATIONAL',
    region: 'NATIONWIDE',
    employmentType: 'INTERN',
    status: 'OPEN',
    dday: 25,
    deadlineDate: '2026-07-19',
    content: '전국 지점에서 근무할 작업치료 인턴을 모집합니다. 정규직 전환 기회.',
    sourceUrl: 'https://example.com/jobs/3',
  },
  {
    id: 2,
    title: '놀이치료사 모집 (마감)',
    organizationName: '푸른나무아동센터',
    therapyArea: 'PLAY',
    region: 'GYEONGNAM',
    employmentType: 'FULL_TIME',
    status: 'CLOSED',
    dday: -2,
    deadlineDate: '2026-06-22',
    content: '경남 창원 놀이치료사 모집 공고였습니다. (마감)',
    sourceUrl: 'https://example.com/jobs/2',
  },
  {
    id: 1,
    title: '감각통합 치료사 (마감)',
    organizationName: '연세아동발달의원',
    therapyArea: 'SENSORY_INTEGRATION',
    region: 'JEJU',
    employmentType: 'CONTRACT',
    status: 'CLOSED',
    dday: -5,
    deadlineDate: '2026-06-19',
    content: '제주 감각통합 치료사 모집 공고였습니다. (마감)',
    sourceUrl: 'https://example.com/jobs/1',
  },
];

export const mockJobPosts: JobPostDetail[] = seeds.map((s) => ({
  ...s,
  therapyAreaLabel: THERAPY_AREA_LABELS[s.therapyArea] ?? s.therapyArea,
  regionLabel: REGION_LABELS[s.region],
  employmentTypeLabel: EMPLOYMENT_TYPE_LABELS[s.employmentType],
  qualification: s.qualification ?? null,
  preferred: s.preferred ?? null,
  salaryText: s.salaryText ?? null,
  authorNickname: 'Mellti AI',
}));
