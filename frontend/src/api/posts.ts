import axios from 'axios';
import axiosInstance from './axiosInstance';
import type {
  PaginatedPosts,
  CursorPagedPosts,
  PostDetail,
  PostCreateRequest,
  PostUpdateRequest,
  PostSort,
  PostType,
  TherapyArea,
  ReactionType,
  PostReaction,
  CommentReaction,
  CommentResponse,
  Attachment,
  PostImage,
  UploadInitRequest,
  UploadInitResponse,
  UploadConfirmRequest,
  UploadConfirmResponse,
} from '../types/post';
import { resolveUploadContentType, type PendingFile } from '@/hooks/useFileAttachment';

export async function fetchPosts(params: {
  therapyArea?: TherapyArea;
  sortType?: PostSort;
  keyword?: string;
  postType?: PostType;
  page?: number;
  size?: number;
}): Promise<PaginatedPosts> {
  const res = await axiosInstance.get('/posts', { params });
  return res.data;
}

export async function fetchFeed(params: {
  cursor?: string;
  size?: number;
  sort?: 'LATEST' | 'POPULAR';
  signal?: AbortSignal;
}): Promise<CursorPagedPosts> {
  const { signal, ...query } = params;
  const res = await axiosInstance.get('/posts/feed', { params: query, signal });
  return res.data?.data ?? res.data;
}

export async function fetchPost(postId: number): Promise<PostDetail> {
  const res = await axiosInstance.get(`/posts/${postId}`);
  return res.data;
}

export async function createPost(data: PostCreateRequest): Promise<PostDetail> {
  const res = await axiosInstance.post('/posts', data);
  return res.data;
}

export async function updatePost(postId: number, data: PostUpdateRequest): Promise<PostDetail> {
  const res = await axiosInstance.patch(`/posts/${postId}`, data);
  return res.data;
}

export async function deletePost(postId: number): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}`);
}

export async function fetchComments(postId: number): Promise<CommentResponse[]> {
  const res = await axiosInstance.get(`/posts/${postId}/comments`);
  // 백엔드는 부모 댓글의 replies[]에 대댓글을 nested(트리)로 내려줌(2단계).
  // 프론트(PostDetailPage/CommentDetailPage)는 한 배열에 flat + parentCommentId 필터로 트리를 재구성하는 구조라
  // 진입점에서 한 번 평탄화해서 호출부 가정과 맞춰준다.
  // 이 어댑터를 거친 뒤로는 작성/삭제/수정 모두 flat 위에서 닫혀 다시 트리로 되돌릴 일은 없음.
  const tree: CommentResponse[] = res.data ?? [];
  return tree.flatMap((parent) => [parent, ...(parent.replies ?? [])]);
}

export async function createComment(
  postId: number,
  data: { content: string; parentCommentId?: number },
): Promise<CommentResponse> {
  const res = await axiosInstance.post(`/posts/${postId}/comments`, data);
  return res.data;
}

export async function updateComment(
  commentId: number,
  data: { content: string },
): Promise<CommentResponse> {
  const res = await axiosInstance.patch(`/comments/${commentId}`, data);
  return res.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await axiosInstance.delete(`/comments/${commentId}`);
}

export async function scrapPost(postId: number): Promise<void> {
  await axiosInstance.post(`/posts/${postId}/scrap`);
}

export async function unscrapPost(postId: number): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}/scrap`);
}

// 게시글 리액션
export async function getPostReaction(postId: number): Promise<PostReaction> {
  const res = await axiosInstance.get(`/posts/${postId}/reaction`);
  return res.data?.data ?? res.data;
}

// toggleCommentReaction함수과 통일 할 예정, 현재 서버 응답을 반영하지 않고 클라이언트 자체적으로만 업데이트중
export async function togglePostReaction(
  postId: number,
  reactionType: ReactionType,
): Promise<PostReaction> {
  const res = await axiosInstance.put(`/posts/${postId}/reaction`, { reactionType });
  return res.data?.data ?? res.data;
}

// 댓글 리액션
export async function getCommentReaction(commentId: number): Promise<CommentReaction> {
  const res = await axiosInstance.get(`/comments/${commentId}/reaction`);
  return res.data?.data ?? res.data;
}

export async function toggleCommentReaction(
  commentId: number,
  reactionType: ReactionType,
): Promise<CommentReaction> {
  const res = await axiosInstance.put(`/comments/${commentId}/reaction`, { reactionType });
  return res.data?.data ?? res.data;
}

// pdf
export async function uploadPostPdf(postId: number, file: File): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post(`/posts/${postId}/attachments`, formData);
  return res.data;
}

// 이미지
export async function uploadPostImage(postId: number, file: File): Promise<PostImage> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post(`/posts/${postId}/images`, formData);
  return res.data;
}

export async function fetchPostImages(postId: number): Promise<PostImage[]> {
  const res = await axiosInstance.get(`/posts/${postId}/images`);
  return res.data?.data ?? res.data;
}

export async function deletePostAttachment(postId: number, attachmentId: number): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}/attachments/${attachmentId}`);
}

export async function deletePostImage(postId: number, imageId: number): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}/images/${imageId}`);
}

// Presigned Upload — 3단계 흐름 (init → S3 PUT → confirm)
export async function initUpload(postId: number, req: UploadInitRequest): Promise<UploadInitResponse> {
  const res = await axiosInstance.post(`/posts/${postId}/uploads/init`, req);
  return res.data?.data ?? res.data;
}

// axiosInstance 대신 raw axios 사용 — presigned URL에 Authorization 헤더를 붙이면 S3 서명 불일치로 에러남
export async function uploadToS3(uploadUrl: string, file: File, contentType: string): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': contentType },
  });
}

export async function confirmUpload(postId: number, req: UploadConfirmRequest): Promise<UploadConfirmResponse> {
  const res = await axiosInstance.post(`/posts/${postId}/uploads/confirm`, req);
  return res.data?.data ?? res.data;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)); 

export async function uploadOneAttachment(
  postId: number,
  pf: PendingFile,
  { maxAttempts = 3 }: { maxAttempts?: number } = {},
): Promise<void>{
  const contentType = resolveUploadContentType(pf.file);

  const { uploadUrl, storedKey } = await initUpload(postId, {
    kind: pf.kind,
    originalFilename: pf.file.name,
    contentType,
    sizeBytes: pf.file.size,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++){
    try {
    await uploadToS3(uploadUrl, pf.file, contentType);
    await confirmUpload(postId, {
      kind: pf.kind,
      storedKey,
      originalFilename: pf.file.name,
    });
    return;
    } catch(err) {
      if(attempt === maxAttempts) throw err
      console.warn('[upload] 재시도', {
        fileName: pf.file.name,
        kind: pf.kind,
        sizeBytes: pf.file.size,
        attempt,
        err,
      });
      await delay(attempt === 1 ? 500 : 1000) ;
    }
  }
}