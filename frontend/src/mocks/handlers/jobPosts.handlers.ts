// 구인공고 핸들러 — 목록(cursor + 필터 4종), 상세, 작성(Phase 2).
import { http, HttpResponse } from 'msw';
import { mockJobPosts } from '../data/jobPosts';
import {
  REGION_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  ALWAYS_OPEN_DEADLINE,
} from '../../constants/jobPost';
import { THERAPY_AREA_LABELS } from '../../constants/post';
import type { JobPostCreatePayload, JobPostDetail } from '../../types/jobPost';

const API = import.meta.env.VITE_API_BASE_URL;

// 마감일까지 남은 일수(자정 기준). 상시모집(sentinel)은 null.
function computeDday(deadlineDate: string): number | null {
  if (deadlineDate === ALWAYS_OPEN_DEADLINE) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(`${deadlineDate}T00:00:00`);
  if (Number.isNaN(deadline.getTime())) return null;
  return Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
}

function encodeCursor(lastId: number): string {
  return btoa(JSON.stringify({ lastId }));
}

function decodeCursor(cursor: string): number | null {
  try {
    const parsed = JSON.parse(atob(cursor));
    return typeof parsed.lastId === 'number' ? parsed.lastId : null;
  } catch {
    return null;
  }
}

export const jobPostsHandlers = [
  http.get(`${API}/job-posts`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const therapyArea = url.searchParams.get('therapyArea');
    const region = url.searchParams.get('region');
    const employmentType = url.searchParams.get('employmentType');
    const rawSize = Number(url.searchParams.get('size') ?? '10');
    const size = Math.min(50, Math.max(1, isNaN(rawSize) ? 10 : rawSize));
    const cursor = url.searchParams.get('cursor');

    // mockJobPosts는 id 내림차순(최신순) 정렬 상태.
    let filtered = mockJobPosts;
    if (status) filtered = filtered.filter((j) => j.status === status);
    if (therapyArea) filtered = filtered.filter((j) => j.therapyArea === therapyArea);
    if (region) filtered = filtered.filter((j) => j.region === region);
    if (employmentType) filtered = filtered.filter((j) => j.employmentType === employmentType);

    let startIdx = 0;
    if (cursor) {
      const lastId = decodeCursor(cursor);
      if (lastId === null) {
        return HttpResponse.json(
          { success: false, code: 'INVALID_INPUT', message: 'invalid cursor' },
          { status: 400 },
        );
      }
      const idx = filtered.findIndex((j) => j.id === lastId);
      startIdx = idx === -1 ? filtered.length : idx + 1;
    }

    const slice = filtered.slice(startIdx, startIdx + size);
    const hasNext = startIdx + size < filtered.length;
    const nextCursor =
      hasNext && slice.length > 0 ? encodeCursor(slice[slice.length - 1].id) : null;

    // 목록은 Summary 필드만 노출 (content/sourceUrl 등 detail 전용 제외).
    const items = slice.map((j) => ({
      id: j.id,
      title: j.title,
      organizationName: j.organizationName,
      therapyArea: j.therapyArea,
      therapyAreaLabel: j.therapyAreaLabel,
      region: j.region,
      regionLabel: j.regionLabel,
      employmentType: j.employmentType,
      employmentTypeLabel: j.employmentTypeLabel,
      status: j.status,
      dday: j.dday,
      deadlineDate: j.deadlineDate,
      alwaysOpen: j.alwaysOpen,
    }));

    return HttpResponse.json({
      success: true,
      data: { items, nextCursor, hasNext, size },
    });
  }),

  http.get(`${API}/job-posts/:id`, ({ params }) => {
    const job = mockJobPosts.find((j) => j.id === Number(params.id));
    if (!job) {
      return HttpResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: job });
  }),

  // 작성(Create) — Phase 2. 페이로드 검증 후 상세 형태로 만들어 최신 상단(unshift)에 추가.
  http.post(`${API}/job-posts`, async ({ request }) => {
    const body = (await request.json()) as JobPostCreatePayload;

    const required =
      body?.organizationName?.trim() &&
      body?.therapyArea &&
      body?.region &&
      body?.employmentType &&
      body?.content?.trim() &&
      body?.sourceUrl?.trim() &&
      body?.deadlineDate;
    if (!required) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_INPUT', message: '필수 항목 누락' },
        { status: 400 },
      );
    }

    // 상시모집이면 sentinel 마감일로 강제(alwaysRecruiting=true가 deadlineDate 이김 — BE 합의).
    const deadlineDate = body.alwaysRecruiting ? ALWAYS_OPEN_DEADLINE : body.deadlineDate;
    const alwaysOpen = body.alwaysRecruiting === true;
    const nextId = mockJobPosts.reduce((max, j) => Math.max(max, j.id), 0) + 1;

    const therapyAreaLabel = THERAPY_AREA_LABELS[body.therapyArea] ?? body.therapyArea;
    const employmentTypeLabel = EMPLOYMENT_TYPE_LABELS[body.employmentType];
    // title은 요청에 없음 — 실제 BE가 서버에서 파생. 목에선 조직명+분야+고용형태로 근사.
    const title = `${body.organizationName.trim()} ${therapyAreaLabel} ${employmentTypeLabel} 모집`;

    const created: JobPostDetail = {
      id: nextId,
      title,
      organizationName: body.organizationName.trim(),
      therapyArea: body.therapyArea,
      therapyAreaLabel,
      region: body.region,
      regionLabel: REGION_LABELS[body.region],
      employmentType: body.employmentType,
      employmentTypeLabel,
      status: 'OPEN',
      dday: computeDday(deadlineDate),
      deadlineDate,
      alwaysOpen,
      content: body.content.trim(),
      qualification: body.qualification?.trim() || null,
      preferred: body.preferred?.trim() || null,
      salaryText: body.salaryText?.trim() || null,
      sourceUrl: body.sourceUrl.trim(),
      authorNickname: '나',
      canEdit: true,
    };

    mockJobPosts.unshift(created);
    return HttpResponse.json({ success: true, data: created }, { status: 201 });
  }),

  // 수정(Update) — Phase 2. PATCH /job-posts/:id. 파생 필드(title/label/dday) 재계산 후 교체.
  http.patch(`${API}/job-posts/:id`, async ({ params, request }) => {
    const idx = mockJobPosts.findIndex((j) => j.id === Number(params.id));
    if (idx === -1) {
      return HttpResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 });
    }
    const body = (await request.json()) as JobPostCreatePayload;

    const required =
      body?.organizationName?.trim() &&
      body?.therapyArea &&
      body?.region &&
      body?.employmentType &&
      body?.content?.trim() &&
      body?.sourceUrl?.trim() &&
      body?.deadlineDate;
    if (!required) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_INPUT', message: '필수 항목 누락' },
        { status: 400 },
      );
    }

    const deadlineDate = body.alwaysRecruiting ? ALWAYS_OPEN_DEADLINE : body.deadlineDate;
    const alwaysOpen = body.alwaysRecruiting === true;
    const therapyAreaLabel = THERAPY_AREA_LABELS[body.therapyArea] ?? body.therapyArea;
    const employmentTypeLabel = EMPLOYMENT_TYPE_LABELS[body.employmentType];
    const title = `${body.organizationName.trim()} ${therapyAreaLabel} ${employmentTypeLabel} 모집`;

    // 기존 항목 기반으로 편집 필드만 덮어씀(id/status/authorNickname/canEdit 등은 유지).
    const updated: JobPostDetail = {
      ...mockJobPosts[idx],
      title,
      organizationName: body.organizationName.trim(),
      therapyArea: body.therapyArea,
      therapyAreaLabel,
      region: body.region,
      regionLabel: REGION_LABELS[body.region],
      employmentType: body.employmentType,
      employmentTypeLabel,
      dday: computeDday(deadlineDate),
      deadlineDate,
      alwaysOpen,
      content: body.content.trim(),
      qualification: body.qualification?.trim() || null,
      preferred: body.preferred?.trim() || null,
      salaryText: body.salaryText?.trim() || null,
      sourceUrl: body.sourceUrl.trim(),
    };

    mockJobPosts[idx] = updated;
    return HttpResponse.json({ success: true, data: updated });
  }),

  // 삭제(Delete) — Phase 2. DELETE /job-posts/:id. 스토어에서 제거, 바디 없이 204.
  http.delete(`${API}/job-posts/:id`, ({ params }) => {
    const idx = mockJobPosts.findIndex((j) => j.id === Number(params.id));
    if (idx === -1) {
      return HttpResponse.json({ success: false, code: 'NOT_FOUND' }, { status: 404 });
    }
    mockJobPosts.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
