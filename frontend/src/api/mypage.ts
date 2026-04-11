import axiosInstance from './axiosInstance';
import type { PaginatedComments, PaginatedScraps } from '../types/mypage';
import type { PaginatedPosts } from '../types/post';

export async function fetchMyPosts(page = 0, size = 10): Promise<PaginatedPosts> {
  const res = await axiosInstance.get('/me/posts', { params: { page, size } });
  return res.data;
}

export async function fetchMyComments(page = 0, size = 10): Promise<PaginatedComments> {
  const res = await axiosInstance.get('/me/comments', { params: { page, size } });
  return res.data;
}

export async function fetchMyScraps(page = 0, size = 10): Promise<PaginatedScraps> {
  const res = await axiosInstance.get('/me/scraps', { params: { page, size } });
  return res.data;
}
