import axiosInstance from './axiosInstance';
import type {
  PaginatedPosts,
  PostDetail,
  PostCreateRequest,
  PostUpdateRequest,
  BoardType,
  PostSort,
  TherapyArea,
  CommentResponse,
} from '../types/post';

export async function fetchPosts(params: {
  board?: BoardType;
  therapyArea?: TherapyArea;
  sortType?: PostSort;
  page?: number;
  size?: number;
}): Promise<PaginatedPosts> {
  const res = await axiosInstance.get('/posts', { params });
  return res.data;
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

export async function deleteComment(commentId: number): Promise<void> {
  await axiosInstance.delete(`/comments/${commentId}`);
}

export async function scrapPost(postId: number): Promise<void> {
  await axiosInstance.post(`/posts/${postId}/scrap`);
}

export async function unscrapPost(postId: number): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}/scrap`);
}

export async function likePost(postId: number): Promise<void> {
  await axiosInstance.put(`/posts/${postId}/reaction`, { reactionType: 'LIKE' });
}

export async function unlikePost(postId: number): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}/reaction`);
}
