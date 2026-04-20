// 첨부파일 핸들러 — 업로드, 삭제
import { http, HttpResponse } from 'msw';
import { mockPosts } from '../data/posts';

const API = import.meta.env.VITE_API_BASE_URL;

export const attachmentsHandlers = [
  // PDF
  http.post(`${API}/posts/:postId/attachments`, async ({ params, request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return HttpResponse.json({ code: 'BAD_REQUEST', message: '파일이 없습니다.' }, { status: 400 });
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

  // 이미지
  http.post(`${API}/posts/:postId/images`, async ({ params, request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return HttpResponse.json({ code: 'BAD_REQUEST', message: '파일이 없습니다.' }, { status: 400 });
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

  http.delete(
    `${API}/posts/:postId/attachments/:attachmentId`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
