// 첨부파일 핸들러 — PDF/이미지 업로드, 조회, 삭제
import { http, HttpResponse } from 'msw';
import { mockPosts } from '../data/posts';
import type { PostImage } from '../../types/post';

const API = import.meta.env.VITE_API_BASE_URL;

// 업로드된 이미지 메모리 저장 (postId → PostImage[]). 실 API의 GET /posts/:id/images 시뮬레이션용.
const mockPostImages = new Map<number, PostImage[]>();

export const attachmentsHandlers = [
  // PDF 업로드
  http.post(`${API}/posts/:postId/attachments`, async ({ params, request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return HttpResponse.json(
        { code: 'BAD_REQUEST', message: '파일이 없습니다.' },
        { status: 400 },
      );
    }

    const post = mockPosts.find((p) => p.id === Number(params.postId));
    if (post) post.hasAttachment = true;

    const attachment = {
      id: Date.now(),
      originalFilename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      extension: file.name.split('.').pop() ?? '',
      downloadUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true, data: attachment }, { status: 201 });
  }),

  // 이미지 업로드 — 응답은 PostImageResponse 스펙 (imageUrl, displayOrder)
  http.post(`${API}/posts/:postId/images`, async ({ params, request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return HttpResponse.json(
        { code: 'BAD_REQUEST', message: '파일이 없습니다.' },
        { status: 400 },
      );
    }

    const postId = Number(params.postId);
    const post = mockPosts.find((p) => p.id === postId);
    if (post) post.hasAttachment = true;

    const existing = mockPostImages.get(postId) ?? [];
    const image: PostImage = {
      id: Date.now(),
      imageUrl: URL.createObjectURL(file),
      originalFilename: file.name,
      displayOrder: existing.length,
      createdAt: new Date().toISOString(),
    };
    mockPostImages.set(postId, [...existing, image]);

    return HttpResponse.json({ success: true, data: image }, { status: 201 });
  }),

  // 이미지 목록 조회
  http.get(`${API}/posts/:postId/images`, ({ params }) => {
    const images = mockPostImages.get(Number(params.postId)) ?? [];
    return HttpResponse.json({ success: true, data: images }, { status: 200 });
  }),

  http.delete(
    `${API}/posts/:postId/attachments/:attachmentId`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
