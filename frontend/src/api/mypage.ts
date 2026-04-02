import axiosInstance from './axiosInstance';
import type { MyActivity } from '../types/mypage';
import type { PostSummary } from '../types/post';

export async function fetchMyPosts(): Promise<PostSummary[]> {
  const res = await axiosInstance.get('/me/posts');
  return res.data;
}

export async function fetchMyActivity(): Promise<MyActivity> {
  const res = await axiosInstance.get('/me/activity');
  return res.data;
}
