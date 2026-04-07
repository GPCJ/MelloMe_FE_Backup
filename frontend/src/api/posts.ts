import axiosInstance from './axiosInstance';
import type {
  PaginatedPosts,
  PostDetail,
  PostCreateRequest,
  PostUpdateRequest,
  PostSort,
  PostType,
  TherapyArea,
  ReactionType,
  PostReaction,
  CommentResponse,
  Attachment,
} from '../types/post';

export async function fetchPosts(params: {
  therapyArea?: TherapyArea;
  sortType?: PostSort;
  keyword?: string;
  postType?: PostType;
  page?: number;
  size?: number;
}): Promise<PaginatedPosts> {
  const res = await axiosInstance.get('/posts', { params });
  const { posts, ...rest } = res.data;
  return { items: posts, ...rest };
}

export async function fetchPost(postId: number): Promise<PostDetail> {
  const res = await axiosInstance.get(`/posts/${postId}`);
  return res.data;
}

export async function createPost(data: PostCreateRequest): Promise<PostDetail> {
  const res = await axiosInstance.post('/posts', data);
  return res.data;
}

export async function updatePost(
  postId: number,
  data: PostUpdateRequest,
): Promise<PostDetail> {
  const res = await axiosInstance.patch(`/posts/${postId}`, data);
  return res.data;
}

export async function deletePost(postId: number): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}`);
}

export async function fetchComments(
  postId: number,
): Promise<CommentResponse[]> {
  const res = await axiosInstance.get(`/posts/${postId}/comments`);
  return res.data;
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

export async function getReaction(postId: number): Promise<PostReaction> {
  const res = await axiosInstance.get(`/posts/${postId}/reaction`);
  return res.data;
}

export async function toggleReaction(
  postId: number,
  reactionType: ReactionType,
): Promise<void> {
  await axiosInstance.put(`/posts/${postId}/reaction`, { reactionType });
}

export async function uploadPostAttachment(
  postId: number,
  file: File,
): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post(
    `/posts/${postId}/attachments`,
    formData,
  );
  return res.data;
}

export async function deletePostAttachment(
  postId: number,
  attachmentId: number,
): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}/attachments/${attachmentId}`);
}
