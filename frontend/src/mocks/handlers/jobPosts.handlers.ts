// 구인공고 핸들러 — 목록(cursor + 필터 4종), 상세. Phase 1 읽기 전용.
import { http, HttpResponse } from 'msw';
import { mockJobPosts } from '../data/jobPosts';

const API = import.meta.env.VITE_API_BASE_URL;

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
];
